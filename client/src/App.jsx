import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

const PRICES = {
  indoor: 2500,    // Внутренняя камера
  outdoor: 4200,   // Уличная камера
  wifi: 3800,      // WiFi камера
  ptz: 8500,      // PTZ камера
  recorder: 12000, // Видеорегистратор
  installation: 1500, // Установка за камеру
  cable: 150,      // Кабель за метр
  cloud_month: 350 // Облако за месяц на камеру
};

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cameras: {
      indoor: 0,
      outdoor: 0,
      wifi: 0,
      ptz: 0
    },
    storage: 7, // дней
    options: {
      mic: false,
      nightVision: true,
      motion: true,
      cloud: false
    },
    name: '',
    phone: '',
    address: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    WebApp.setHeaderColor('#1a1a2e');
    WebApp.setBackgroundColor('#0f0f1a');
  }, []);

  const calculateTotal = () => {
    let total = 0;
    
    // Камеры
    total += formData.cameras.indoor * PRICES.indoor;
    total += formData.cameras.outdoor * PRICES.outdoor;
    total += formData.cameras.wifi * PRICES.wifi;
    total += formData.cameras.ptz * PRICES.ptz;
    
    // Видеорегистратор (если есть камеры)
    const totalCameras = Object.values(formData.cameras).reduce((a, b) => a + b, 0);
    if (totalCameras > 0) {
      total += PRICES.recorder;
    }
    
    // Установка
    if (totalCameras > 0) {
      total += totalCameras * PRICES.installation;
    }
    
    // Кабель (условно 20м на камеру)
    if (totalCameras > 0) {
      total += totalCameras * 20 * PRICES.cable;
    }
    
    // Облако
    if (formData.options.cloud) {
      total += totalCameras * formData.storage * PRICES.cloud_month;
    }
    
    return total;
  };

  const handleSubmit = async () => {
    const order = {
      ...formData,
      total: calculateTotal(),
      createdAt: new Date().toISOString()
    };

    try {
      await fetch('https://your-server.com/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      setSubmitted(true);
      WebApp.HapticFeedback.notificationOccurred('success');
    } catch (error) {
      console.error('Error:', error);
      WebApp.HapticFeedback.notificationOccurred('error');
    }
  };

  const handleOrderClick = () => {
    WebApp.HapticFeedback.impactOccurred('medium');
    setStep(4);
  };

  const formatPrice = (price) => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  if (submitted) {
    return (
      <div className="app">
        <div className="header">
          <div className="logo">📹</div>
          <h1>Novasat</h1>
          <p>Магазин систем безопасности</p>
        </div>
        
        <div className="section" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div className="modal-icon">✅</div>
          <h2>Заявка отправлена!</h2>
          <p>Мы свяжемся с вами в течение 15 минут</p>
        </div>
        
        <div className="summary">
          <button className="btn btn-primary" onClick={() => {
            setSubmitted(false);
            setFormData({
              cameras: { indoor: 0, outdoor: 0, wifi: 0, ptz: 0 },
              storage: 7,
              options: { mic: false, nightVision: true, motion: true, cloud: false },
              name: '', phone: '', address: ''
            });
            setStep(1);
          }}>
            Новый расчёт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="logo">📹</div>
        <h1>Калькулятор видеонаблюдения</h1>
        <p>Рассчитайте стоимость за 1 минуту</p>
      </div>

      {/* Progress */}
      <div className="progress-dots">
        <div className={`progress-dot ${step >= 1 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 3 ? 'active' : ''}`}></div>
        <div className={`progress-dot ${step >= 4 ? 'active' : ''}`}></div>
      </div>

      {/* Step 1: Количество камер */}
      {step === 1 && (
        <div className="step">
          <div className="section">
            <h3 className="section-title">Сколько камер нужно?</h3>
            <div className="camera-grid">
              <button 
                className={`camera-btn ${formData.cameras.indoor > 0 ? 'active' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    cameras: { ...formData.cameras, indoor: formData.cameras.indoor + 1 }
                  });
                }}
              >
                <span className="icon">🏠</span>
                <span className="count">{formData.cameras.indoor}</span>
                <span className="label">Внутри</span>
              </button>
              
              <button 
                className={`camera-btn ${formData.cameras.outdoor > 0 ? 'active' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    cameras: { ...formData.cameras, outdoor: formData.cameras.outdoor + 1 }
                  });
                }}
              >
                <span className="icon">🌤️</span>
                <span className="count">{formData.cameras.outdoor}</span>
                <span className="label">Уличные</span>
              </button>
              
              <button 
                className={`camera-btn ${formData.cameras.wifi > 0 ? 'active' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    cameras: { ...formData.cameras, wifi: formData.cameras.wifi + 1 }
                  });
                }}
              >
                <span className="icon">📶</span>
                <span className="count">{formData.cameras.wifi}</span>
                <span className="label">WiFi</span>
              </button>
              
              <button 
                className={`camera-btn ${formData.cameras.ptz > 0 ? 'active' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    cameras: { ...formData.cameras, ptz: formData.cameras.ptz + 1 }
                  });
                }}
              >
                <span className="icon">🔄</span>
                <span className="count">{formData.cameras.ptz}</span>
                <span className="label">PTZ</span>
              </button>
            </div>
            
            {Object.values(formData.cameras).reduce((a, b) => a + b, 0) > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button 
                  onClick={() => {
                    WebApp.HapticFeedback.impactOccurred('light');
                    setFormData({
                      ...formData,
                      cameras: { indoor: 0, outdoor: 0, wifi: 0, ptz: 0 }
                    });
                  }}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: '#6366f1', 
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Сбросить
                </button>
              </div>
            )}
          </div>

          {/* Хранение */}
          <div className="section">
            <h3 className="section-title">Хранение записей</h3>
            <div className="range-container">
              <div className="range-header">
                <span className="range-label">Количество дней</span>
                <span className="range-value">{formData.storage} дней</span>
              </div>
              <input
                type="range"
                className="range-slider"
                min="3"
                max="30"
                value={formData.storage}
                onChange={(e) => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({ ...formData, storage: parseInt(e.target.value) });
                }}
              />
            </div>
          </div>

          {/* Опции */}
          <div className="section">
            <h3 className="section-title">Дополнительные опции</h3>
            <div className="options-list">
              <div 
                className={`option-item ${formData.options.cloud ? 'checked' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    options: { ...formData.options, cloud: !formData.options.cloud }
                  });
                }}
              >
                <div className="option-left">
                  <span className="option-icon">☁️</span>
                  <span className="option-text">Облако ({formData.storage} дней)</span>
                </div>
                <span className="option-price">+{formatPrice(formData.options.cloud ? 0 : 1)}/мес</span>
              </div>
              
              <div 
                className={`option-item ${formData.options.mic ? 'checked' : ''}`}
                onClick={() => {
                  WebApp.HapticFeedback.impactOccurred('light');
                  setFormData({
                    ...formData,
                    options: { ...formData.options, mic: !formData.options.mic }
                  });
                }}
              >
                <div className="option-left">
                  <span className="option-icon">🎤</span>
                  <span className="option-text">Запись звука</span>
                </div>
                <span className="option-price">+0 ₽</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary">
            <div className="summary-row">
              <span className="summary-label">Примерная стоимость</span>
              <span className="summary-price">{formatPrice(calculateTotal())}</span>
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleOrderClick}
            >
              Оставить заявку
            </button>
            <p className="summary-note">Точную цену назовёт инженер</p>
          </div>
        </div>
      )}

      {/* Step 2-4: Form */}
      {step >= 2 && (
        <div className="step">
          <div className="section">
            <h3 className="section-title">Ваши контакты</h3>
            
            <div className="form-group">
              <label className="form-label">Как вас зовут?</label>
              <input
                type="text"
                className="form-input"
                placeholder="Иван Иванов"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Телефон</label>
              <input
                type="tel"
                className="form-input"
                placeholder="+7 (999) 000-00-00"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Адрес установки</label>
              <input
                type="text"
                className="form-input"
                placeholder="г. Дербент, ул. Примерная, д. 1"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="summary">
            <div className="summary-row">
              <span className="summary-label">Итого</span>
              <span className="summary-price">{formatPrice(calculateTotal())}</span>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (formData.name && formData.phone) {
                  handleSubmit();
                } else {
                  WebApp.HapticFeedback.notificationOccurred('error');
                  alert('Заполните имя и телефон');
                }
              }}
            >
              Отправить заявку
            </button>
            
            <button 
              className="btn"
              onClick={() => {
                WebApp.HapticFeedback.impactOccurred('light');
                setStep(step - 1);
              }}
              style={{ 
                background: 'transparent', 
                color: '#8892b0',
                marginTop: '10px'
              }}
            >
              ← Назад
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
