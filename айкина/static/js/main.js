(function() {
    'use strict';

    // =============================================
    // НАЧАЛЬНЫЕ ДАННЫЕ (демо-заявки и отзывы)
    // =============================================
    function initDefaultData() {
        let apps = getApplications();
        let feedbacks = getFeedbacks();

        if (apps.length === 0) {
            const defaultApps = [
                {
                    id: 1,
                    transport: 'Автобус',
                    startDate: '25.12.2026',
                    payment: 'Наличные',
                    status: 'Новая',
                    createdAt: '20.12.2026',
                    icon: '🚌'
                },
                {
                    id: 2,
                    transport: 'Электробус',
                    startDate: '10.01.2026',
                    payment: 'Банковская карта',
                    status: 'Идет обучение',
                    createdAt: '05.01.2026',
                    icon: '🔋'
                },
                {
                    id: 3,
                    transport: 'Трамвай',
                    startDate: '15.11.2025',
                    payment: 'Рассрочка',
                    status: 'Обучение завершено',
                    createdAt: '01.11.2025',
                    icon: '🚋'
                },
                {
                    id: 4,
                    transport: 'Автобус',
                    startDate: '01.03.2026',
                    payment: 'Безналичный расчет',
                    status: 'Обучение завершено',
                    createdAt: '15.02.2026',
                    icon: '🚌'
                }
            ];
            saveApplications(defaultApps);
            apps = defaultApps;
        }

        if (feedbacks.length === 0) {
            const defaultFeedbacks = [
                {
                    id: 1,
                    applicationId: 3,
                    rating: 5,
                    content: 'Отличное обучение! Инструкторы профессионалы, всё понятно объясняют. Рекомендую!',
                    createdAt: '15.12.2025 14:30'
                },
                {
                    id: 2,
                    applicationId: 4,
                    rating: 4,
                    content: 'Хорошее обучение. Немного сложно было с практикой, но инструктор помог разобраться.',
                    createdAt: '10.03.2026 16:20'
                }
            ];
            saveFeedbacks(defaultFeedbacks);
            feedbacks = defaultFeedbacks;
        }
    }

    // =============================================
    // РАБОТА С LOCALSTORAGE
    // =============================================
    
    function getApplications() {
        try {
            const data = localStorage.getItem('applications');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveApplications(apps) {
        localStorage.setItem('applications', JSON.stringify(apps));
    }

    function getFeedbacks() {
        try {
            const data = localStorage.getItem('feedbacks');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveFeedbacks(fb) {
        localStorage.setItem('feedbacks', JSON.stringify(fb));
    }

    function getNextAppId() {
        const apps = getApplications();
        if (apps.length === 0) return 1;
        return Math.max(...apps.map(a => a.id)) + 1;
    }

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

    const countEl = document.getElementById('appsCount');
    if (countEl) countEl.textContent = apps.length;

    if (apps.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="bi bi-info-circle"></i> У вас пока нет заявок. 
                <a href="application.html" style="color: #007bff;">Создайте первую!</a>
            </div>
        `;
        return;
    }

    let html = '';
    apps.forEach(function(app, index) {
        const hasFeedback = feedbacks.some(f => f.applicationId === app.id);
        
        // Определяем класс статуса
        let statusClass = '';
        if (app.status === 'Новая') {
            statusClass = 'badge-status-new';
        } else if (app.status === 'Идет обучение') {
            statusClass = 'badge-status-progress';
        } else if (app.status === 'Обучение завершено') {
            statusClass = 'badge-status-completed';
        }
        
        html += `
            <div class="card">
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
                            <span class="badge ${statusClass}">${app.status}</span>
                            ${app.status === 'Обучение завершено' && !hasFeedback ? `
                                <button class="btn btn-sm btn-outline-primary d-block mt-2" 
                                        onclick="openFeedbackForm(${app.id})" style="border-radius: 20px; color: #007bff; border-color: #007bff;">
                                    <i class="bi bi-chat"></i> Оставить отзыв
                                </button>
                            ` : ''}
                            ${hasFeedback ? `
                                <span class="badge bg-primary d-block mt-2" style="background: #007bff; color: #ffffff;">
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
}
    // =============================================
    // ОТОБРАЖЕНИЕ ОТЗЫВОВ В ПРОФИЛЕ
    // =============================================
    function renderFeedbacks() {
        const container = document.getElementById('feedbacksContainer');
        if (!container) return;

        const feedbacks = getFeedbacks();

        const countEl = document.getElementById('fbCount');
        if (countEl) countEl.textContent = feedbacks.length;

        if (feedbacks.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Вы еще не оставили ни одного отзыва.
                </div>
            `;
            return;
        }

        let html = '';
        feedbacks.forEach(function(fb, index) {
            const stars = '⭐'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
            html += `
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <span style="font-size: 14px;">${stars}</span>
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
    // ОТКРЫТИЕ ФОРМЫ ОТЗЫВА
    // =============================================
    window.openFeedbackForm = function(applicationId) {
        const apps = getApplications();
        const app = apps.find(a => a.id === applicationId);
        if (!app) return;

        const modalHTML = `
            <div class="modal fade" id="feedbackModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                        <div class="modal-header" style="border-bottom: none; padding-bottom: 0;">
                            <h5 class="modal-title" style="color: #0d47a1; font-weight: 700;">
                                <i class="bi bi-chat" style="color: #007bff;"></i> Оставить отзыв
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div style="background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px;">
                                <p class="mb-1"><strong>Заявка #${applicationId}</strong></p>
                                <p class="mb-0 text-muted small">${app.icon || '🚌'} ${app.transport} | ${app.startDate}</p>
                            </div>
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
                                    <small class="text-muted">Минимум 10 символов</small>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer" style="border-top: none; padding-top: 0;">
                            <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal" style="background: #6c757d; border: none; color: #ffffff; border-radius: 20px;">
                                Отмена
                            </button>
                            <button type="button" class="btn btn-primary px-4" id="submitFeedbackBtn" style="background: #007bff; border: none; color: #ffffff; border-radius: 20px;">
                                <i class="bi bi-send"></i> Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const oldModal = document.getElementById('feedbackModal');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById('feedbackModal');
        const modal = new bootstrap.Modal(modalElement, {
            backdrop: 'static'
        });

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

            addFeedback(applicationId, rating.value, content.value.trim());

            modal.hide();
            
            renderFeedbacks();
            renderApplications();

            showModal({
                title: '⭐ Спасибо за ваш отзыв!',
                message: 'Ваше мнение очень важно для нас!',
                type: 'info',
                buttonText: 'Отлично!',
                redirectUrl: null
            });
        });

        modal.show();

        modalElement.addEventListener('hidden.bs.modal', function() {
            modalElement.remove();
        });
    };

    // =============================================
    // МОДАЛЬНОЕ ОКНО
    // =============================================
    function showModal(options) {
        const defaults = {
            title: 'Уведомление',
            message: '',
            type: 'info',
            buttonText: 'Закрыть',
            redirectUrl: null,
            icon: null
        };

        const settings = Object.assign({}, defaults, options);

        const icons = {
            success: '<i class="bi bi-check-circle-fill" style="font-size: 48px; color: #007bff;"></i>',
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
                    <div class="modal-content" style="border-radius: 12px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
                        <div class="modal-body text-center p-4">
                            <div class="mb-3">
                                ${icon}
                            </div>
                            <h4 class="mb-2" style="color: #0d47a1; font-weight: 700;">${settings.title}</h4>
                            <p class="text-muted mb-4" style="font-size: 16px;">${settings.message}</p>
                            <button type="button" class="btn btn-primary px-4 py-2" 
                                    style="min-width: 120px; font-weight: 600; background: #007bff; border: none; color: #ffffff; border-radius: 20px;" 
                                    id="modalCloseBtn">
                                ${settings.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

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
                
                const today = new Date().toLocaleDateString('ru-RU');
                const userData = {
                    login: login.value,
                    fullName: document.getElementById('fullName').value,
                    email: email.value,
                    phone: phone.value,
                    birthDate: document.getElementById('birthDate').value,
                    regDate: today,
                    isAdmin: false
                };
                
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                showModal({
                    title: 'Регистрация успешна!',
                    message: `Добро пожаловать, <strong>${userData.fullName}</strong>!<br>Вы будете перенаправлены в личный кабинет.`,
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
                
                const userData = {
                    login: login.value,
                    fullName: login.value,
                    email: login.value + '@mail.ru',
                    phone: '+7 (999) 000-00-00',
                    birthDate: '01.01.1990',
                    regDate: new Date().toLocaleDateString('ru-RU'),
                    isAdmin: login.value === 'Admin26'
                };
                
                if (login.value === 'Admin26' && password.value === 'Demo20') {
                    userData.fullName = 'Администратор Системы';
                    userData.email = 'admin@passazhiry.ru';
                    userData.phone = '+7 (999) 000-0000';
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    
                    showModal({
                        title: 'Добро пожаловать, Администратор!',
                        message: 'Вы успешно вошли в панель управления.',
                        type: 'success',
                        buttonText: 'Перейти в админку',
                        redirectUrl: 'admin.html'
                    });
                } else if (login.value && password.value) {
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    
                    showModal({
                        title: 'Добро пожаловать!',
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
            
            const transport = form.querySelector('select[name="transport"]');
            const payment = form.querySelector('select[name="payment"]');
            
            const transportValue = transport ? transport.value : 'Автобус';
            const paymentValue = payment ? payment.value : 'Наличные';
            
            const newApp = addApplication(transportValue, dateValue, paymentValue);
            
            showModal({
                title: 'Заявка успешно создана!',
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
                helpText.style.color = '#007bff';
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
        if (!document.getElementById('applicationsContainer')) return;

        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!userData.login) {
            window.location.href = 'login.html';
            return;
        }
        
        if (userData.fullName) {
            document.querySelectorAll('#userNameNav').forEach(function(el) {
                el.textContent = userData.fullName;
            });
        } else {
            document.querySelectorAll('#userNameNav').forEach(function(el) {
                el.textContent = userData.login;
            });
        }
        
        const nameElement = document.getElementById('userName');
        if (nameElement) {
            nameElement.textContent = userData.fullName || userData.login;
        }
        
        const loginEl = document.getElementById('userLogin');
        if (loginEl) loginEl.textContent = userData.login || '—';
        
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.textContent = userData.email || '—';
        
        const phoneEl = document.getElementById('userPhone');
        if (phoneEl) phoneEl.textContent = userData.phone || '—';
        
        const birthDateEl = document.getElementById('userBirthDate');
        if (birthDateEl) birthDateEl.textContent = userData.birthDate || '—';
        
        const regDateEl = document.getElementById('userRegDate');
        if (regDateEl) {
            if (userData.regDate) {
                regDateEl.textContent = userData.regDate;
            } else {
                const today = new Date().toLocaleDateString('ru-RU');
                regDateEl.textContent = today;
                userData.regDate = today;
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        }

        renderApplications();
        renderFeedbacks();

        const apps = getApplications();
        const feedbacks = getFeedbacks();
        const countAppEl = document.getElementById('appsCount');
        const countFbEl = document.getElementById('fbCount');
        if (countAppEl) countAppEl.textContent = apps.length;
        if (countFbEl) countFbEl.textContent = feedbacks.length;

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
    // АДМИН-ПАНЕЛЬ
    // =============================================
    function initAdminPanel() {
        const tableBody = document.getElementById('adminTableBody');
        if (!tableBody) return;

        const apps = getApplications();
        
        const newCount = apps.filter(a => a.status === 'Новая').length;
        const progressCount = apps.filter(a => a.status === 'Идет обучение').length;
        const completedCount = apps.filter(a => a.status === 'Обучение завершено').length;

        const newEl = document.getElementById('newCount');
        const progressEl = document.getElementById('progressCount');
        const completedEl = document.getElementById('completedCount');
        const totalEl = document.getElementById('totalCount');
        
        if (newEl) newEl.textContent = newCount;
        if (progressEl) progressEl.textContent = progressCount;
        if (completedEl) completedEl.textContent = completedCount;
        if (totalEl) totalEl.textContent = apps.length;

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
                    <tr>
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
                            <button class="btn btn-sm btn-outline-primary px-2" 
                                    onclick="changeStatus(${app.id})" style="border-radius: 20px; color: #007bff; border-color: #007bff;">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
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

        app.status = newStatus;
        saveApplications(apps);

        showModal({
            title: 'Статус обновлен',
            message: `
                <div style="text-align: left; background: #f8f9fa; padding: 12px 16px; border-radius: 8px; margin: 8px 0;">
                    <p style="margin: 4px 0;"><strong>Заявка #${app.id}</strong></p>
                    <p style="margin: 4px 0;"><strong>Новый статус:</strong> ${newStatus}</p>
                </div>
            `,
            type: 'info',
            buttonText: 'Обновить список',
            redirectUrl: null
        });

        setTimeout(initAdminPanel, 500);
    };

    // =============================================
    // ЗАПУСК
    // =============================================
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Пассажирам.РФ - Запуск...');
        
        initDefaultData();
        initSliders();
        initNavScroll();
        initRegisterForm();
        initLoginForm();
        initApplicationForm();
        initPasswordValidation();
        initProfile();
        initAdminPanel();
        
        console.log('Готово!');
    });

    window.showModal = showModal;
    window.renderApplications = renderApplications;
    window.renderFeedbacks = renderFeedbacks;
    window.getApplications = getApplications;
    window.getFeedbacks = getFeedbacks;
    window.addApplication = addApplication;
    window.addFeedback = addFeedback;

})();