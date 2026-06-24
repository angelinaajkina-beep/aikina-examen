(function() {
    'use strict';

    // =============================================
    // РАБОТА С LOCALSTORAGE
    // =============================================
    
    // Получить все заявки
    function getApplications() {
        try {
            const data = localStorage.getItem('applications');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    // Сохранить заявки
    function saveApplications(apps) {
        localStorage.setItem('applications', JSON.stringify(apps));
    }

    // Получить все отзывы
    function getFeedbacks() {
        try {
            const data = localStorage.getItem('feedbacks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    // Сохранить отзывы
    function saveFeedbacks(fb) {
        localStorage.setItem('feedbacks', JSON.stringify(fb));
    }

    // Получить следующее ID для заявки
    function getNextAppId() {
        const apps = getApplications();
        if (apps.length === 0) return 1;
        return Math.max(...apps.map(a => a.id)) + 1;
    }

    // Получить следующее ID для отзыва
    function getNextFeedbackId() {
        const fb = getFeedbacks();
        if (fb.length === 0) return 1;
        return Math.max(...fb.map(f => f.id)) + 1;
    }

    // =============================================
    // ОТОБРАЖЕНИЕ ЗАЯВОК В ПРОФИЛЕ
    // =============================================
    function renderApplications() {
        const container = document.getElementById('applicationsContainer');
        if (!container) return;

        const apps = getApplications();
        const feedbacks = getFeedbacks();

        if (apps.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info animate-on-scroll">
                    <i class="bi bi-info-circle"></i> У вас пока нет заявок. 
                    <a href="application.html" style="color: #007bff;">Создайте первую!</a>
                </div>
            `;
            return;
        }

        let html = '';
        apps.forEach(function(app, index) {
            // Проверяем, есть ли отзыв на эту заявку
            const hasFeedback = feedbacks.some(f => f.applicationId === app.id);
            
            html += `
                <div class="card animate-on-scroll" style="animation-delay: ${index * 0.05}s;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h4 class="mb-1">${app.icon || '🚌'} ${app.transport}</h4>
                                <small class="text-muted">
                                    <i class="bi bi-calendar"></i> ${app.startDate}
                                    <span class="mx-2">|</span>
                                    <i class="bi bi-credit-card"></i> ${app.payment}
                                </small>
                                <br>
                                <small class="text-muted">
                                    <i class="bi bi-clock"></i> Создана: ${app.createdAt}
                                </small>
                            </div>
                            <div class="text-end">
                                <span class="badge 
                                    ${app.status === 'Новая' ? 'badge-status-new' : 
                                      app.status === 'Идет обучение' ? 'badge-status-progress' : 
                                      'badge-status-completed'}">
                                    ${app.status}
                                </span>
                                ${app.status === 'Обучение завершено' && !hasFeedback ? `
                                    <button class="btn btn-sm btn-outline-primary d-block mt-2" 
                                            onclick="openFeedbackForm(${app.id})">
                                        <i class="bi bi-chat"></i> Оставить отзыв
                                    </button>
                                ` : ''}
                                ${hasFeedback ? `
                                    <span class="badge bg-success d-block mt-2">
                                        <i class="bi bi-check-circle"></i> Отзыв оставлен
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        // Запускаем анимацию для новых элементов
        setTimeout(initScrollAnimations, 100);
    }

    // =============================================
    // ОТОБРАЖЕНИЕ ОТЗЫВОВ В ПРОФИЛЕ
    // =============================================
    function renderFeedbacks() {
        const container = document.getElementById('feedbacksContainer');
        if (!container) return;

        const feedbacks = getFeedbacks();

        if (feedbacks.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info animate-on-scroll">
                    <i class="bi bi-info-circle"></i> Вы еще не оставили ни одного отзыва.
                </div>
            `;
            return;
        }

        let html = '';
        feedbacks.forEach(function(fb, index) {
            const stars = '⭐'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
            html += `
                <div class="card animate-on-scroll" style="animation-delay: ${index * 0.05}s;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <span class="badge bg-warning text-dark">${stars}</span>
                            </div>
                            <small class="text-muted">${fb.createdAt}</small>
                        </div>
                        <p class="mb-1 mt-2">${fb.content}</p>
                        ${fb.applicationId ? `<small class="text-muted">К заявке #${fb.applicationId}</small>` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        setTimeout(initScrollAnimations, 100);
    }

    // =============================================
    // ДОБАВЛЕНИЕ НОВОЙ ЗАЯВКИ
    // =============================================
    function addApplication(transport, startDate, payment) {
        const apps = getApplications();
        const newApp = {
            id: getNextAppId(),
            transport: transport,
            startDate: startDate,
            payment: payment,
            status: 'Новая',
            createdAt: new Date().toLocaleDateString('ru-RU'),
            icon: transport === 'Автобус' ? '🚌' : 
                  transport === 'Электробус' ? '🔋' : '🚋'
        };
        apps.push(newApp);
        saveApplications(apps);
        return newApp;
    }

    // =============================================
    // ДОБАВЛЕНИЕ ОТЗЫВА
    // =============================================
    function addFeedback(applicationId, rating, content) {
        const feedbacks = getFeedbacks();
        const newFeedback = {
            id: getNextFeedbackId(),
            applicationId: applicationId,
            rating: parseInt(rating),
            content: content,
            createdAt: new Date().toLocaleDateString('ru-RU') + ' ' + new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})
        };
        feedbacks.push(newFeedback);
        saveFeedbacks(feedbacks);
        return newFeedback;
    }

    // =============================================
    // ОТКРЫТИЕ ФОРМЫ ОТЗЫВА (глобальная функция)
    // =============================================
    window.openFeedbackForm = function(applicationId) {
        // Находим заявку
        const apps = getApplications();
        const app = apps.find(a => a.id === applicationId);
        if (!app) return;

        // Создаем модальное окно с формой отзыва
        const modalHTML = `
            <div class="modal fade" id="feedbackModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                            <h5 class="modal-title" style="color: #0d47a1; font-weight: 700;">
                                <i class="bi bi-chat" style="color: #007bff;"></i> Оставить отзыв
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p class="text-muted small">
                                Заявка #${applicationId}: <strong>${app.transport}</strong> (${app.startDate})
                            </p>
                            <form id="feedbackModalForm">
                                <div class="mb-3">
                                    <label class="form-label">Оценка:</label>
                                    <select class="form-select" id="feedbackRating" required>
                                        <option value="5">⭐ 5 — Отлично</option>
                                        <option value="4">⭐ 4 — Хорошо</option>
                                        <option value="3">⭐ 3 — Удовлетворительно</option>
                                        <option value="2">⭐ 2 — Плохо</option>
                                        <option value="1">⭐ 1 — Ужасно</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Текст отзыва:</label>
                                    <textarea class="form-control" id="feedbackContent" 
                                              rows="3" placeholder="Расскажите о вашем опыте обучения..." 
                                              minlength="10" required></textarea>
                                    <div class="invalid-feedback" id="feedbackContentError">
                                        Отзыв должен содержать минимум 10 символов
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer" style="border-top: none; padding-top: 0;">
                            <button type="button" class="btn btn-secondary rounded-pill px-4" data-bs-dismiss="modal">
                                Отмена
                            </button>
                            <button type="button" class="btn btn-primary rounded-pill px-4" id="submitFeedbackBtn">
                                <i class="bi bi-send"></i> Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Удаляем старое модальное окно если есть
        const oldModal = document.getElementById('feedbackModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('feedbackModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static'
        });

        // Обработчик отправки
        document.getElementById('submitFeedbackBtn').addEventListener('click', function() {
            const rating = document.getElementById('feedbackRating');
            const content = document.getElementById('feedbackContent');
            const error = document.getElementById('feedbackContentError');

            if (content.value.trim().length < 10) {
                content.classList.add('is-invalid');
                error.textContent = 'Отзыв должен содержать минимум 10 символов';
                return;
            }

            content.classList.remove('is-invalid');

            // Сохраняем отзыв
            addFeedback(applicationId, rating.value, content.value.trim());

            // Показываем успех
            modal.hide();
            
            // Обновляем список отзывов и заявок
            renderFeedbacks();
            renderApplications();

            showModal({
                title: '⭐ Спасибо за ваш отзыв!',
                message: 'Ваше мнение очень важно для нас!',
                type: 'success',
                buttonText: 'Отлично!',
                redirectUrl: null
            });
        });

        modal.show();

        // Обработка закрытия
        modalElement.addEventListener('hidden.bs.modal', function() {
            modalElement.remove();
        });
    };

    // =============================================
    // СОЗДАНИЕ КРАСИВОГО МОДАЛЬНОГО ОКНА
    // =============================================
    function showModal(options) {
        const defaults = {
            title: 'Уведомление',
            message: '',
            type: 'success',
            buttonText: 'Закрыть',
            redirectUrl: null,
            icon: null
        };

        const settings = Object.assign({}, defaults, options);

        const icons = {
            success: '<i class="bi bi-check-circle-fill" style="font-size: 48px; color: #28a745;"></i>',
            error: '<i class="bi bi-x-circle-fill" style="font-size: 48px; color: #dc3545;"></i>',
            warning: '<i class="bi bi-exclamation-triangle-fill" style="font-size: 48px; color: #ffc107;"></i>',
            info: '<i class="bi bi-info-circle-fill" style="font-size: 48px; color: #007bff;"></i>'
        };

        const icon = settings.icon || icons[settings.type] || icons.info;

        const oldModal = document.getElementById('customModal');
        if (oldModal) oldModal.remove();

        const modalHTML = `
            <div class="modal fade" id="customModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 16px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                        <div class="modal-body text-center p-4">
                            <div class="mb-3 animate-icon">
                                ${icon}
                            </div>
                            <h4 class="mb-2" style="color: #0d47a1; font-weight: 700;">${settings.title}</h4>
                            <p class="text-muted mb-4" style="font-size: 16px;">${settings.message}</p>
                            <button type="button" class="btn btn-${settings.type === 'success' ? 'success' : settings.type === 'error' ? 'danger' : settings.type === 'warning' ? 'warning' : 'primary'} rounded-pill px-4 py-2" 
                                    style="min-width: 120px; font-weight: 600;" 
                                    id="modalCloseBtn">
                                ${settings.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            .animate-icon {
                animation: modalBounce 0.6s ease-out;
            }
            @keyframes modalBounce {
                0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
                50% { transform: scale(1.1) rotate(2deg); }
                70% { transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1) rotate(0deg); }
            }
            .modal-backdrop {
                background-color: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            #customModal .modal-content {
                animation: modalSlideIn 0.4s ease-out;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-30px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('customModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true
        });

        const closeBtn = document.getElementById('modalCloseBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                modal.hide();
                if (settings.redirectUrl) {
                    setTimeout(function() {
                        window.location.href = settings.redirectUrl;
                    }, 300);
                }
            });
        }

        modalElement.addEventListener('hidden.bs.modal', function() {
            if (settings.redirectUrl) {
                window.location.href = settings.redirectUrl;
            }
        });

        modal.show();
        return modal;
    }

    // =============================================
    // СЛАЙДЕР
    // =============================================
    function initSliders() {
        const swipers = document.querySelectorAll('.swiper');
        if (typeof Swiper === 'undefined') return;

        swipers.forEach(function(swiperEl) {
            new Swiper(swiperEl, {
                loop: true,
                autoplay: {
                    delay: 3000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: swiperEl.querySelector('.swiper-pagination'),
                    clickable: true,
                },
                navigation: {
                    nextEl: swiperEl.querySelector('.swiper-button-next'),
                    prevEl: swiperEl.querySelector('.swiper-button-prev'),
                },
                speed: 600,
            });
        });
    }

    // =============================================
    // АНИМАЦИЯ НАВИГАЦИИ ПРИ СКРОЛЛЕ
    // =============================================
    function initNavScroll() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;

        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // =============================================
    // АНИМАЦИЯ ПРИ СКРОЛЛЕ
    // =============================================
    function initScrollAnimations() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        if (!elements.length) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const delay = parseFloat(entry.target.style.animationDelay) || 0;
                    setTimeout(function() {
                        entry.target.classList.add('visible');
                    }, delay * 1000);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // =============================================
    // РЕГИСТРАЦИЯ
    // =============================================
    function initRegisterForm() {
        const form = document.getElementById('registerForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let errors = [];
            
            const login = document.getElementById('login');
            const loginError = document.getElementById('loginError');
            if (!/^[a-zA-Z0-9]{6,}$/.test(login.value)) {
                login.classList.add('is-invalid');
                loginError.textContent = 'Логин: только латиница и цифры, мин. 6 символов';
                errors.push('Неверный логин');
            } else {
                login.classList.remove('is-invalid');
            }
            
            const password = document.getElementById('password');
            const passwordError = document.getElementById('passwordError');
            if (password.value.length < 8) {
                password.classList.add('is-invalid');
                passwordError.textContent = 'Пароль должен содержать минимум 8 символов';
                errors.push('Короткий пароль');
            } else {
                password.classList.remove('is-invalid');
            }
            
            const phone = document.getElementById('phone');
            const phoneError = document.getElementById('phoneError');
            const phoneClean = phone.value.replace(/[^\d+]/g, '');
            if (phoneClean.length < 10) {
                phone.classList.add('is-invalid');
                phoneError.textContent = 'Введите корректный номер телефона';
                errors.push('Неверный телефон');
            } else {
                phone.classList.remove('is-invalid');
            }
            
            const email = document.getElementById('email');
            const emailError = document.getElementById('emailError');
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
                email.classList.add('is-invalid');
                emailError.textContent = 'Введите корректный email адрес';
                errors.push('Неверный email');
            } else {
                email.classList.remove('is-invalid');
            }
            
            const errorsDiv = document.getElementById('registerErrors');
            const errorMessage = document.getElementById('errorMessage');
            
            if (errors.length > 0) {
                errorsDiv.classList.remove('d-none');
                errorMessage.textContent = 'Пожалуйста, исправьте ошибки в форме';
                errorsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                errorsDiv.classList.add('d-none');
                
                // Имитация сохранения пользователя в localStorage
                const userData = {
                    login: login.value,
                    fullName: document.getElementById('fullName').value,
                    email: email.value,
                    phone: phone.value
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                showModal({
                    title: '🎉 Регистрация успешна!',
                    message: 'Добро пожаловать в Пассажирам.РФ!<br>Вы будете перенаправлены в личный кабинет.',
                    type: 'success',
                    buttonText: 'Войти в кабинет',
                    redirectUrl: 'profile.html'
                });
                
                form.reset();
                form.querySelectorAll('.is-valid').forEach(function(el) {
                    el.classList.remove('is-valid');
                });
            }
        });
    }

    // =============================================
    // АВТОРИЗАЦИЯ
    // =============================================
    function initLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const login = document.getElementById('loginInput');
            const password = document.getElementById('passwordInput');
            const loginError = document.getElementById('loginInputError');
            const passwordError = document.getElementById('passwordInputError');
            
            let errors = [];
            
            if (!login.value || login.value.length < 3) {
                login.classList.add('is-invalid');
                loginError.textContent = 'Введите корректный логин';
                errors.push('Неверный логин');
            } else {
                login.classList.remove('is-invalid');
            }
            
            if (!password.value || password.value.length < 4) {
                password.classList.add('is-invalid');
                passwordError.textContent = 'Введите корректный пароль';
                errors.push('Неверный пароль');
            } else {
                password.classList.remove('is-invalid');
            }
            
            const errorsDiv = document.getElementById('loginErrors');
            const errorMessage = document.getElementById('loginErrorMessage');
            
            if (errors.length > 0) {
                errorsDiv.classList.remove('d-none');
                errorMessage.textContent = 'Неправильный логин или пароль';
                errorsDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                errorsDiv.classList.add('d-none');
                
                // Сохраняем пользователя в localStorage
                const userData = {
                    login: login.value,
                    isAdmin: login.value === 'Admin26'
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                if (login.value === 'Admin26' && password.value === 'Demo20') {
                    showModal({
                        title: '🔐 Добро пожаловать, Администратор!',
                        message: 'Вы успешно вошли в панель управления.',
                        type: 'success',
                        buttonText: 'Перейти в админку',
                        redirectUrl: 'admin.html'
                    });
                } else if (login.value && password.value) {
                    showModal({
                        title: '👋 Добро пожаловать!',
                        message: `Вы успешно вошли как <strong>${login.value}</strong>.`,
                        type: 'success',
                        buttonText: 'Перейти в кабинет',
                        redirectUrl: 'profile.html'
                    });
                }
            }
        });
    }

    // =============================================
    // ОФОРМЛЕНИЕ ЗАЯВКИ
    // =============================================
    function initApplicationForm() {
        const form = document.getElementById('applicationForm');
        if (!form) return;

        const dateInput = document.getElementById('startDate');
        
        dateInput.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '.' + value.slice(2);
            }
            if (value.length >= 5) {
                value = value.slice(0, 5) + '.' + value.slice(5);
            }
            this.value = value.slice(0, 10);
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const dateError = document.getElementById('dateError');
            const dateValue = dateInput.value;
            
            if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateValue)) {
                dateInput.classList.add('is-invalid');
                dateError.textContent = 'Используйте формат ДД.ММ.ГГГГ';
                dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            const parts = dateValue.split('.');
            const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateObj < today) {
                dateInput.classList.add('is-invalid');
                dateError.textContent = 'Дата не может быть в прошлом';
                dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            dateInput.classList.remove('is-invalid');
            
            // Получаем выбранные значения
            const transport = form.querySelector('select[name="transport"]');
            const payment = form.querySelector('select[name="payment"]');
            
            const transportValue = transport ? transport.value : 'Автобус';
            const paymentValue = payment ? payment.value : 'Наличные';
            
            // СОХРАНЯЕМ ЗАЯВКУ В LOCALSTORAGE
            const newApp = addApplication(transportValue, dateValue, paymentValue);
            
            // Красивое модальное окно с деталями
            showModal({
                title: '✅ Заявка успешно создана!',
                message: `
                    <div style="text-align: left; background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
                        <p style="margin: 4px 0;"><strong>№ заявки:</strong> #${newApp.id}</p>
                        <p style="margin: 4px 0;"><strong>Вид транспорта:</strong> ${transportValue}</p>
                        <p style="margin: 4px 0;"><strong>Дата начала:</strong> ${dateValue}</p>
                        <p style="margin: 4px 0;"><strong>Способ оплаты:</strong> ${paymentValue}</p>
                        <p style="margin: 4px 0;"><strong>Статус:</strong> <span class="badge badge-status-new">Новая</span></p>
                    </div>
                    <small class="text-muted">Заявка отправлена на согласование администратору</small>
                `,
                type: 'success',
                buttonText: 'Вернуться в кабинет',
                redirectUrl: 'profile.html'
            });
            
            form.reset();
        });
    }

    // =============================================
    // ПАРОЛЬ В РЕАЛЬНОМ ВРЕМЕНИ
    // =============================================
    function initPasswordValidation() {
        const passwordInput = document.getElementById('password');
        const helpText = document.getElementById('passwordHelp');
        if (!passwordInput || !helpText) return;

        passwordInput.addEventListener('input', function() {
            if (this.value.length >= 8) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
                helpText.textContent = '✓ Пароль надежный';
                helpText.style.color = '#28a745';
            } else {
                this.classList.remove('is-valid');
                helpText.textContent = 'Введите пароль (мин. 8 символов)';
                helpText.style.color = '#6c757d';
            }
        });
    }

    // =============================================
    // ЗАГРУЗКА ДАННЫХ НА СТРАНИЦЕ ПРОФИЛЯ
    // =============================================
    function initProfile() {
        // Проверяем, что мы на странице профиля
        if (!document.getElementById('applicationsContainer')) return;

        // Загружаем данные пользователя
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userNameElement = document.querySelector('.card h3 .bi-person-circle');
        if (userNameElement && userData.fullName) {
            const nameSpan = userNameElement.parentElement;
            nameSpan.innerHTML = `<i class="bi bi-person-circle" style="color: #007bff;"></i> ${userData.fullName}`;
        }

        // Обновляем логин в профиле
        if (userData.login) {
            const loginElements = document.querySelectorAll('.card-body p strong');
            loginElements.forEach(function(el) {
                if (el.textContent === 'Логин:') {
                    el.parentElement.innerHTML = `<strong>Логин:</strong> ${userData.login}`;
                }
                if (el.textContent === 'Email:' && userData.email) {
                    el.parentElement.innerHTML = `<strong>Email:</strong> ${userData.email}`;
                }
                if (el.textContent === 'Телефон:' && userData.phone) {
                    el.parentElement.innerHTML = `<strong>Телефон:</strong> ${userData.phone}`;
                }
            });
        }

        // Рендерим заявки и отзывы
        renderApplications();
        renderFeedbacks();

        // Обновляем счетчики в табах
        const apps = getApplications();
        const feedbacks = getFeedbacks();
        const tabButtons = document.querySelectorAll('.nav-tabs .nav-link');
        tabButtons.forEach(function(btn) {
            if (btn.textContent.includes('Заявки')) {
                btn.innerHTML = `<i class="bi bi-list-check"></i> Мои заявки (${apps.length})`;
            }
            if (btn.textContent.includes('Отзывы')) {
                btn.innerHTML = `<i class="bi bi-star"></i> Мои отзывы (${feedbacks.length})`;
            }
        });

        // Подписываемся на обновления вкладок
        document.querySelectorAll('.nav-tabs .nav-link').forEach(function(tab) {
            tab.addEventListener('shown.bs.tab', function() {
                if (this.getAttribute('data-bs-target') === '#applications') {
                    renderApplications();
                }
                if (this.getAttribute('data-bs-target') === '#feedbacks') {
                    renderFeedbacks();
                }
            });
        });
    }

    // =============================================
    // АДМИН-ПАНЕЛЬ - ОБНОВЛЕНИЕ СТАТУСА
    // =============================================
    function initAdminPanel() {
        if (!document.getElementById('adminStats')) return;

        const apps = getApplications();
        
        // Обновляем статистику
        const newCount = apps.filter(a => a.status === 'Новая').length;
        const progressCount = apps.filter(a => a.status === 'Идет обучение').length;
        const completedCount = apps.filter(a => a.status === 'Обучение завершено').length;

        const statsContainer = document.querySelector('.card .d-flex.flex-wrap.gap-2');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <span class="badge badge-status-new">🆕 Новая: ${newCount}</span>
                <span class="badge badge-status-progress">📖 Идет: ${progressCount}</span>
                <span class="badge badge-status-completed">✅ Завершено: ${completedCount}</span>
            `;
        }

        // Обновляем таблицу заявок
        const tableBody = document.querySelector('.table tbody');
        if (tableBody) {
            if (apps.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-muted">Нет заявок</td>
                    </tr>
                `;
            } else {
                let html = '';
                apps.forEach(function(app, index) {
                    const statusClass = app.status === 'Новая' ? 'badge-status-new' :
                                       app.status === 'Идет обучение' ? 'badge-status-progress' :
                                       'badge-status-completed';
                    html += `
                        <tr class="animate-on-scroll" style="animation-delay: ${index * 0.03}s;">
                            <td><strong>${app.id}</strong></td>
                            <td>
                                <strong>${localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')).fullName || 'Пользователь' : 'Пользователь'}</strong>
                                <br>
                                <small class="text-muted">user_${app.id}</small>
                            </td>
                            <td>${app.icon || '🚌'} ${app.transport}</td>
                            <td>${app.startDate}</td>
                            <td>
                                <span class="badge ${statusClass}">${app.status}</span>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary rounded-pill px-2" 
                                        onclick="changeStatus(${app.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
                tableBody.innerHTML = html;
                setTimeout(initScrollAnimations, 100);
            }
        }

        // Обновляем общее количество
        const totalElement = document.querySelector('.small-text');
        if (totalElement) {
            totalElement.textContent = `Всего: ${apps.length} заявок`;
        }
    }

    // =============================================
    // ИЗМЕНЕНИЕ СТАТУСА ЗАЯВКИ (АДМИН)
    // =============================================
    window.changeStatus = function(appId) {
        const apps = getApplications();
        const app = apps.find(a => a.id === appId);
        if (!app) return;

        const statuses = ['Новая', 'Идет обучение', 'Обучение завершено'];
        const currentIndex = statuses.indexOf(app.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const newStatus = statuses[nextIndex];

        // Меняем статус
        app.status = newStatus;
        saveApplications(apps);

        // Показываем уведомление
        const statusEmojis = {
            'Новая': '🆕',
            'Идет обучение': '📖',
            'Обучение завершено': '✅'
        };

        showModal({
            title: '📝 Статус обновлен',
            message: `
                <div style="text-align: left; background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
                    <p style="margin: 4px 0;"><strong>Заявка #${app.id}</strong></p>
                    <p style="margin: 4px 0;"><strong>Новый статус:</strong> ${statusEmojis[newStatus] || ''} ${newStatus}</p>
                </div>
            `,
            type: 'info',
            buttonText: 'Обновить список',
            redirectUrl: null
        });

        // Обновляем админ-панель
        setTimeout(initAdminPanel, 500);
    };

    // =============================================
    // ЗАПУСК
    // =============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚌 Пассажирам.РФ - Запуск...');
        
        initSliders();
        initNavScroll();
        initScrollAnimations();
        initRegisterForm();
        initLoginForm();
        initApplicationForm();
        initPasswordValidation();
        
        // Инициализация профиля
        initProfile();
        
        // Инициализация админки
        initAdminPanel();
        
        console.log('✅ Готово!');
    });

    // Делаем функции доступными глобально
    window.showModal = showModal;
    window.renderApplications = renderApplications;
    window.renderFeedbacks = renderFeedbacks;
    window.getApplications = getApplications;
    window.getFeedbacks = getFeedbacks;
    window.addApplication = addApplication;
    window.addFeedback = addFeedback;

})();