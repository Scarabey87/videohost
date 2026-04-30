from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from functools import wraps
import os
import uuid
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24).hex()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///platform.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max

# Create upload folders
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'videos'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'previews'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'avatars'), exist_ok=True)
os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'personas'), exist_ok=True)

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    is_vip = db.Column(db.Boolean, default=False)
    vip_expires = db.Column(db.DateTime, nullable=True)
    avatar = db.Column(db.String(256), default='default.png')
    bio = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    failed_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Persona(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    photo = db.Column(db.String(256), default='default_persona.png')
    description = db.Column(db.Text, default='')
    is_vip = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    videos = db.relationship('Video', backref='persona', lazy=True)

class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    filename = db.Column(db.String(256), nullable=False)
    preview = db.Column(db.String(256), default='default_preview.png')
    persona_id = db.Column(db.Integer, db.ForeignKey('persona.id'), nullable=True)
    is_vip = db.Column(db.Boolean, default=False)
    is_published = db.Column(db.Boolean, default=True)
    views = db.Column(db.Integer, default=0)
    duration = db.Column(db.Float, default=0)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(100), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploader = db.relationship('User', backref='uploaded_videos')

class ViewLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    video_id = db.Column(db.Integer, db.ForeignKey('video.id'), nullable=False)
    watched_duration = db.Column(db.Float, default=0)
    watched_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='view_logs')
    video = db.relationship('Video', backref='view_logs')

class ActionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text, default='')
    ip_address = db.Column(db.String(45), default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref='action_logs')

class SiteSettings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text, nullable=False)

class VIPPlan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    days = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, default='')

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Security decorators
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Требуется права администратора', 'error')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def check_ip_rate_limit():
    # Simple IP rate limiting (in production use Redis)
    pass

def log_action(action, details='', user=None):
    log = ActionLog(
        user_id=user.id if user else (current_user.id if current_user.is_authenticated else None),
        action=action,
        details=details,
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()

# Routes
@app.route('/')
def index():
    videos = Video.query.filter_by(is_published=True).order_by(Video.views.desc()).limit(12).all()
    personas = Persona.query.all()
    site_name = SiteSettings.query.filter_by(key='site_name').first()
    return render_template('index.html', videos=videos, personas=personas, site_name=site_name.value if site_name else 'AI Video Platform')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        errors = []
        
        if not username or len(username) < 3:
            errors.append('Имя пользователя должно быть не менее 3 символов')
        elif User.query.filter_by(username=username).first():
            errors.append('Имя пользователя уже занято')
        
        if not email or not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            errors.append('Некорректный email')
        elif User.query.filter_by(email=email).first():
            errors.append('Email уже зарегистрирован')
        
        if not password or len(password) < 8:
            errors.append('Пароль должен быть не менее 8 символов')
        
        if password != confirm_password:
            errors.append('Пароли не совпадают')
        
        if errors:
            for error in errors:
                flash(error, 'error')
            return render_template('register.html')
        
        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        
        log_action('registration', f'User {username} registered')
        login_user(user)
        flash('Регистрация успешна! Добро пожаловать!', 'success')
        return redirect(url_for('index'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')
        
        user = User.query.filter_by(username=username).first()
        
        if user:
            if user.locked_until and user.locked_until > datetime.utcnow():
                flash(f'Аккаунт заблокирован до {user.locked_until.strftime("%H:%M")}', 'error')
                return render_template('login.html')
            
            if user.check_password(password):
                user.failed_attempts = 0
                user.locked_until = None
                db.session.commit()
                login_user(user)
                log_action('login', f'User {username} logged in', user)
                flash('Вход выполнен успешно!', 'success')
                next_page = request.args.get('next')
                return redirect(next_page if next_page else url_for('index'))
            else:
                user.failed_attempts += 1
                if user.failed_attempts >= 5:
                    user.locked_until = datetime.utcnow() + timedelta(minutes=15)
                    flash('Слишком много неудачных попыток. Аккаунт заблокирован на 15 минут.', 'error')
                else:
                    flash('Неверный логин или пароль', 'error')
                db.session.commit()
        else:
            flash('Неверный логин или пароль', 'error')
        
        return render_template('login.html')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    log_action('logout', f'User {current_user.username} logged out', current_user)
    logout_user()
    flash('Вы вышли из аккаунта', 'info')
    return redirect(url_for('index'))

@app.route('/video/<int:video_id>')
def watch_video(video_id):
    video = Video.query.get_or_404(video_id)
    
    if not video.is_published:
        if not current_user.is_authenticated or not current_user.is_admin:
            abort(404)
    
    if video.is_vip and (not current_user.is_authenticated or not current_user.is_vip or 
                         (current_user.is_vip and current_user.vip_expires and current_user.vip_expires < datetime.utcnow())):
        flash('Требуется VIP-подписка для просмотра этого видео', 'error')
        return redirect(url_for('vip'))
    
    # Increment views
    video.views += 1
    
    # Log view
    if current_user.is_authenticated:
        view_log = ViewLog(user_id=current_user.id, video_id=video.id)
        db.session.add(view_log)
    
    db.session.commit()
    
    # Get recommendations
    recommendations = Video.query.filter(
        Video.is_published == True,
        Video.id != video.id,
        Video.persona_id == video.persona_id if video.persona_id else True
    ).order_by(Video.views.desc()).limit(4).all()
    
    return render_template('watch.html', video=video, recommendations=recommendations)

@app.route('/videos')
def videos():
    page = request.args.get('page', 1, type=int)
    persona_id = request.args.get('persona', type=int)
    category = request.args.get('category', '')
    is_vip = request.args.get('vip', type=int)
    
    query = Video.query.filter_by(is_published=True)
    
    if persona_id:
        query = query.filter_by(persona_id=persona_id)
    if category:
        query = query.filter_by(category=category)
    if is_vip is not None:
        query = query.filter_by(is_vip=bool(is_vip))
    
    pagination = query.order_by(Video.created_at.desc()).paginate(page=page, per_page=12, error_out=False)
    personas = Persona.query.all()
    
    return render_template('videos.html', pagination=pagination, personas=personas, 
                         selected_persona=persona_id, selected_category=category)

@app.route('/personas')
def personas():
    all_personas = Persona.query.all()
    return render_template('personas.html', personas=all_personas)

@app.route('/persona/<slug>')
def persona_detail(slug):
    persona = Persona.query.filter_by(slug=slug).first_or_404()
    videos = Video.query.filter_by(persona_id=persona.id, is_published=True).all()
    return render_template('persona_detail.html', persona=persona, videos=videos)

@app.route('/vip')
@login_required
def vip():
    plans = VIPPlan.query.all()
    return render_template('vip.html', plans=plans)

@app.route('/vip/subscribe/<int:plan_id>', methods=['POST'])
@login_required
def subscribe_vip(plan_id):
    plan = VIPPlan.query.get_or_404(plan_id)
    
    # Simulate payment processing
    current_user.is_vip = True
    current_user.vip_expires = datetime.utcnow() + timedelta(days=plan.days)
    db.session.commit()
    
    log_action('vip_subscribe', f'Subscribed to {plan.name}', current_user)
    flash(f'VIP-подписка "{plan.name}" активирована на {plan.days} дней!', 'success')
    
    return redirect(url_for('profile'))

@app.route('/profile')
@login_required
def profile():
    view_history = ViewLog.query.filter_by(user_id=current_user.id).order_by(ViewLog.watched_at.desc()).limit(10).all()
    uploaded_videos = Video.query.filter_by(uploaded_by=current_user.id).all()
    
    return render_template('profile.html', 
                         view_history=view_history, 
                         uploaded_videos=uploaded_videos)

@app.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        bio = request.form.get('bio', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        if email and email != current_user.email:
            if User.query.filter_by(email=email).first():
                flash('Email уже используется', 'error')
                return render_template('edit_profile.html')
            current_user.email = email
        
        current_user.bio = bio
        
        if new_password:
            if len(new_password) < 8:
                flash('Пароль должен быть не менее 8 символов', 'error')
                return render_template('edit_profile.html')
            if new_password != confirm_password:
                flash('Пароли не совпадают', 'error')
                return render_template('edit_profile.html')
            current_user.set_password(new_password)
            log_action('password_change', 'Password changed', current_user)
            logout_user()
            flash('Пароль изменён. Пожалуйста, войдите снова.', 'info')
            return redirect(url_for('login'))
        
        # Handle avatar upload
        if 'avatar' in request.files:
            file = request.files['avatar']
            if file and file.filename:
                ext = file.filename.rsplit('.', 1)[1].lower()
                if ext in ['jpg', 'jpeg', 'png', 'gif']:
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'avatars', filename))
                    current_user.avatar = filename
        
        db.session.commit()
        log_action('profile_edit', 'Profile updated', current_user)
        flash('Профиль обновлён', 'success')
        return redirect(url_for('profile'))
    
    return render_template('edit_profile.html')

# Admin routes
@app.route('/admin')
@login_required
@admin_required
def admin_dashboard():
    total_users = User.query.count()
    vip_users = User.query.filter_by(is_vip=True).count()
    total_videos = Video.query.count()
    total_views = db.session.query(db.func.sum(Video.views)).scalar() or 0
    recent_registrations = User.query.order_by(User.created_at.desc()).limit(5).all()
    popular_videos = Video.query.order_by(Video.views.desc()).limit(5).all()
    popular_personas = Persona.query.all()  # Could add view count tracking
    
    return render_template('admin/dashboard.html',
                         total_users=total_users,
                         vip_users=vip_users,
                         total_videos=total_videos,
                         total_views=total_views,
                         recent_registrations=recent_registrations,
                         popular_videos=popular_videos,
                         popular_personas=popular_personas)

@app.route('/admin/videos', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_videos():
    if request.method == 'POST':
        # Handle bulk actions
        action = request.form.get('bulk_action')
        video_ids = request.form.getlist('video_ids')
        
        if action and video_ids:
            videos = Video.query.filter(Video.id.in_(video_ids)).all()
            if action == 'publish':
                for v in videos:
                    v.is_published = True
            elif action == 'unpublish':
                for v in videos:
                    v.is_published = False
            elif action == 'make_vip':
                for v in videos:
                    v.is_vip = True
            elif action == 'make_free':
                for v in videos:
                    v.is_vip = False
            db.session.commit()
            flash('Действие выполнено', 'success')
    
    page = request.args.get('page', 1, type=int)
    filter_status = request.args.get('status', '')
    filter_vip = request.args.get('vip', '')
    filter_persona = request.args.get('persona', type=int)
    
    query = Video.query
    
    if filter_status == 'published':
        query = query.filter_by(is_published=True)
    elif filter_status == 'draft':
        query = query.filter_by(is_published=False)
    
    if filter_vip == 'vip':
        query = query.filter_by(is_vip=True)
    elif filter_vip == 'free':
        query = query.filter_by(is_vip=False)
    
    if filter_persona:
        query = query.filter_by(persona_id=filter_persona)
    
    pagination = query.order_by(Video.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    personas = Persona.query.all()
    
    return render_template('admin/videos.html', pagination=pagination, personas=personas,
                         filter_status=filter_status, filter_vip=filter_vip, filter_persona=filter_persona)

@app.route('/admin/videos/upload', methods=['GET', 'POST'])
@login_required
@admin_required
def upload_video():
    if request.method == 'POST':
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '')
        persona_id = request.form.get('persona_id', type=int)
        category = request.form.get('category', '')
        is_vip = bool(request.form.get('is_vip'))
        
        if not title:
            flash('Название обязательно', 'error')
            return render_template('admin/upload_video.html', personas=Persona.query.all())
        
        # Handle video file
        video_file = request.files.get('video_file')
        if not video_file or not video_file.filename:
            flash('Файл видео обязателен', 'error')
            return render_template('admin/upload_video.html', personas=Persona.query.all())
        
        ext = video_file.filename.rsplit('.', 1)[1].lower()
        if ext not in ['mp4', 'webm', 'avi', 'mov', 'mkv']:
            flash('Недопустимый формат видео', 'error')
            return render_template('admin/upload_video.html', personas=Persona.query.all())
        
        filename = f"{uuid.uuid4().hex}.{ext}"
        video_file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'videos', filename))
        
        # Handle preview
        preview_filename = 'default_preview.png'
        if 'preview' in request.files:
            preview_file = request.files['preview']
            if preview_file and preview_file.filename:
                ext = preview_file.filename.rsplit('.', 1)[1].lower()
                if ext in ['jpg', 'jpeg', 'png', 'gif']:
                    preview_filename = f"{uuid.uuid4().hex}.{ext}"
                    preview_file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'previews', preview_filename))
        
        video = Video(
            title=title,
            description=description,
            filename=filename,
            preview=preview_filename,
            persona_id=persona_id if persona_id else None,
            category=category,
            is_vip=is_vip,
            uploaded_by=current_user.id
        )
        db.session.add(video)
        db.session.commit()
        
        log_action('video_upload', f'Uploaded video: {title}', current_user)
        flash('Видео загружено успешно', 'success')
        return redirect(url_for('admin_videos'))
    
    personas = Persona.query.all()
    return render_template('admin/upload_video.html', personas=personas)

@app.route('/admin/videos/edit/<int:video_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_video(video_id):
    video = Video.query.get_or_404(video_id)
    
    if request.method == 'POST':
        video.title = request.form.get('title', '').strip()
        video.description = request.form.get('description', '')
        video.persona_id = request.form.get('persona_id', type=int) or None
        video.category = request.form.get('category', '')
        video.is_vip = bool(request.form.get('is_vip'))
        video.is_published = bool(request.form.get('is_published'))
        
        if 'preview' in request.files:
            preview_file = request.files['preview']
            if preview_file and preview_file.filename:
                ext = preview_file.filename.rsplit('.', 1)[1].lower()
                if ext in ['jpg', 'jpeg', 'png', 'gif']:
                    preview_filename = f"{uuid.uuid4().hex}.{ext}"
                    preview_file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'previews', preview_filename))
                    video.preview = preview_filename
        
        db.session.commit()
        log_action('video_edit', f'Edited video: {video.title}', current_user)
        flash('Видео обновлено', 'success')
        return redirect(url_for('admin_videos'))
    
    personas = Persona.query.all()
    return render_template('admin/edit_video.html', video=video, personas=personas)

@app.route('/admin/videos/delete/<int:video_id>', methods=['POST'])
@login_required
@admin_required
def delete_video(video_id):
    video = Video.query.get_or_404(video_id)
    
    # Delete files
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], 'videos', video.filename))
    except FileNotFoundError:
        pass
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], 'previews', video.preview))
    except FileNotFoundError:
        pass
    
    log_action('video_delete', f'Deleted video: {video.title}', current_user)
    db.session.delete(video)
    db.session.commit()
    
    flash('Видео удалено', 'success')
    return redirect(url_for('admin_videos'))

@app.route('/admin/users')
@login_required
@admin_required
def admin_users():
    page = request.args.get('page', 1, type=int)
    search = request.args.get('search', '')
    filter_type = request.args.get('type', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            (User.username.ilike(f'%{search}%')) | 
            (User.email.ilike(f'%{search}%'))
        )
    
    if filter_type == 'vip':
        query = query.filter_by(is_vip=True)
    elif filter_type == 'admin':
        query = query.filter_by(is_admin=True)
    elif filter_type == 'inactive':
        query = query.filter_by(is_active=False)
    
    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    
    return render_template('admin/users.html', pagination=pagination, search=search, filter_type=filter_type)

@app.route('/admin/users/edit/<int:user_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_user(user_id):
    user = User.query.get_or_404(user_id)
    
    if request.method == 'POST':
        user.username = request.form.get('username', '').strip()
        user.email = request.form.get('email', '').strip()
        user.is_vip = bool(request.form.get('is_vip'))
        user.is_active = bool(request.form.get('is_active'))
        user.is_admin = bool(request.form.get('is_admin'))
        
        vip_days = request.form.get('vip_days', type=int)
        if vip_days:
            user.is_vip = True
            user.vip_expires = datetime.utcnow() + timedelta(days=vip_days)
        
        new_password = request.form.get('new_password', '')
        if new_password and len(new_password) >= 8:
            user.set_password(new_password)
        
        db.session.commit()
        log_action('user_edit', f'Edited user: {user.username}', current_user)
        flash('Пользователь обновлён', 'success')
        return redirect(url_for('admin_users'))
    
    return render_template('admin/edit_user.html', user=user)

@app.route('/admin/users/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def admin_delete_user(user_id):
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        flash('Нельзя удалить самого себя', 'error')
        return redirect(url_for('admin_users'))
    
    log_action('user_delete', f'Deleted user: {user.username}', current_user)
    db.session.delete(user)
    db.session.commit()
    
    flash('Пользователь удалён', 'success')
    return redirect(url_for('admin_users'))

@app.route('/admin/personas', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_personas():
    if request.method == 'POST':
        # Handle bulk actions
        action = request.form.get('bulk_action')
        persona_ids = request.form.getlist('persona_ids')
        
        if action and persona_ids:
            personas = Persona.query.filter(Persona.id.in_(persona_ids)).all()
            # Implement bulk actions if needed
            db.session.commit()
    
    personas = Persona.query.order_by(Persona.created_at.desc()).all()
    return render_template('admin/personas.html', personas=personas)

@app.route('/admin/personas/add', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_add_persona():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '')
        is_vip = bool(request.form.get('is_vip'))
        
        if not name:
            flash('Имя обязательно', 'error')
            return render_template('admin/add_persona.html')
        
        slug = name.lower().replace(' ', '-').replace('_', '-')
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        
        # Handle photo
        photo_filename = 'default_persona.png'
        if 'photo' in request.files:
            photo_file = request.files['photo']
            if photo_file and photo_file.filename:
                ext = photo_file.filename.rsplit('.', 1)[1].lower()
                if ext in ['jpg', 'jpeg', 'png', 'gif']:
                    photo_filename = f"{uuid.uuid4().hex}.{ext}"
                    photo_file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'personas', photo_filename))
        
        persona = Persona(
            name=name,
            slug=slug,
            photo=photo_filename,
            description=description,
            is_vip=is_vip
        )
        db.session.add(persona)
        db.session.commit()
        
        log_action('persona_add', f'Added persona: {name}', current_user)
        flash('Персона добавлена', 'success')
        return redirect(url_for('admin_personas'))
    
    return render_template('admin/add_persona.html')

@app.route('/admin/personas/edit/<int:persona_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_persona(persona_id):
    persona = Persona.query.get_or_404(persona_id)
    
    if request.method == 'POST':
        persona.name = request.form.get('name', '').strip()
        persona.description = request.form.get('description', '')
        persona.is_vip = bool(request.form.get('is_vip'))
        
        if 'photo' in request.files:
            photo_file = request.files['photo']
            if photo_file and photo_file.filename:
                ext = photo_file.filename.rsplit('.', 1)[1].lower()
                if ext in ['jpg', 'jpeg', 'png', 'gif']:
                    photo_filename = f"{uuid.uuid4().hex}.{ext}"
                    photo_file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'personas', photo_filename))
                    persona.photo = photo_filename
        
        db.session.commit()
        log_action('persona_edit', f'Edited persona: {persona.name}', current_user)
        flash('Персона обновлена', 'success')
        return redirect(url_for('admin_personas'))
    
    return render_template('admin/edit_persona.html', persona=persona)

@app.route('/admin/personas/delete/<int:persona_id>', methods=['POST'])
@login_required
@admin_required
def admin_delete_persona(persona_id):
    persona = Persona.query.get_or_404(persona_id)
    
    if persona.videos:
        flash('Нельзя удалить персону с привязанными видео', 'error')
        return redirect(url_for('admin_personas'))
    
    log_action('persona_delete', f'Deleted persona: {persona.name}', current_user)
    db.session.delete(persona)
    db.session.commit()
    
    flash('Персона удалена', 'success')
    return redirect(url_for('admin_personas'))

@app.route('/admin/logs')
@login_required
@admin_required
def admin_logs():
    page = request.args.get('page', 1, type=int)
    filter_user = request.args.get('user', type=int)
    filter_action = request.args.get('action', '')
    date_from = request.args.get('date_from', '')
    date_to = request.args.get('date_to', '')
    
    query = ActionLog.query
    
    if filter_user:
        query = query.filter_by(user_id=filter_user)
    if filter_action:
        query = query.filter(ActionLog.action.ilike(f'%{filter_action}%'))
    if date_from:
        query = query.filter(ActionLog.created_at >= datetime.strptime(date_from, '%Y-%m-%d'))
    if date_to:
        query = query.filter(ActionLog.created_at <= datetime.strptime(date_to, '%Y-%m-%d') + timedelta(days=1))
    
    pagination = query.order_by(ActionLog.created_at.desc()).paginate(page=page, per_page=50, error_out=False)
    users = User.query.all()
    
    return render_template('admin/logs.html', pagination=pagination, users=users,
                         filter_user=filter_user, filter_action=filter_action,
                         date_from=date_from, date_to=date_to)

@app.route('/admin/settings', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_settings():
    if request.method == 'POST':
        settings_data = {
            'site_name': request.form.get('site_name', ''),
            'contact_email': request.form.get('contact_email', ''),
            'about_text': request.form.get('about_text', ''),
            'faq_text': request.form.get('faq_text', ''),
        }
        
        for key, value in settings_data.items():
            setting = SiteSettings.query.filter_by(key=key).first()
            if setting:
                setting.value = value
            else:
                setting = SiteSettings(key=key, value=value)
                db.session.add(setting)
        
        # Handle VIP plans
        plan_names = request.form.getlist('plan_names[]')
        plan_days = request.form.getlist('plan_days[]', type=int)
        plan_prices = request.form.getlist('plan_prices[]', type=float)
        plan_descs = request.form.getlist('plan_descs[]')
        
        VIPPlan.query.delete()
        for i, name in enumerate(plan_names):
            if name:
                plan = VIPPlan(name=name, days=plan_days[i], price=plan_prices[i], description=plan_descs[i])
                db.session.add(plan)
        
        db.session.commit()
        log_action('settings_update', 'Site settings updated', current_user)
        flash('Настройки сохранены', 'success')
        return redirect(url_for('admin_settings'))
    
    settings = {s.key: s.value for s in SiteSettings.query.all()}
    plans = VIPPlan.query.all()
    
    return render_template('admin/settings.html', settings=settings, plans=plans)

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(403)
def forbidden(e):
    return render_template('errors/403.html'), 403

@app.errorhandler(500)
def server_error(e):
    return render_template('errors/500.html'), 500

# Static file serving for uploads
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Initialize database
with app.app_context():
    db.create_all()
    
    # Create default admin if not exists
    admin = User.query.filter_by(username='admin').first()
    if not admin:
        admin = User(username='admin', email='admin@example.com', is_admin=True)
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
    
    # Create default VIP plans if not exist
    if not VIPPlan.query.first():
        plans = [
            VIPPlan(name='Недельный', days=7, price=99, description='Доступ ко всем VIP-видео на 7 дней'),
            VIPPlan(name='Месячный', days=30, price=299, description='Доступ ко всем VIP-видео на 30 дней'),
            VIPPlan(name='Квартальный', days=90, price=699, description='Доступ ко всем VIP-видео на 90 дней'),
        ]
        for plan in plans:
            db.session.add(plan)
        db.session.commit()
    
    # Create default site settings
    if not SiteSettings.query.first():
        settings = [
            SiteSettings(key='site_name', value='AI Video Platform'),
            SiteSettings(key='contact_email', value='support@aivideo.com'),
            SiteSettings(key='about_text', value='Платформа для просмотра видео с AI-персонами.'),
            SiteSettings(key='faq_text', value='Часто задаваемые вопросы...'),
        ]
        for setting in settings:
            db.session.add(setting)
        db.session.commit()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
