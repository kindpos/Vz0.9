import { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import SnapshotScreen from './components/SnapshotScreen';
import OrderScreen from './components/OrderScreen';
import CheckOverviewScreen from './components/CheckOverviewScreen';
import PaymentScreen from './components/PaymentScreen';
import CloseDayScreen from './components/CloseDayScreen';
import BatchSettleScreen from './components/BatchSettleScreen';
import SalesReportingScreen from './components/SalesReportingScreen';
import LaborReportingScreen from './components/LaborReportingScreen';
import MenuConfigScreen from './components/MenuConfigScreen';
import MessengerScreen from './components/MessengerScreen';
import HardwareScreen from './components/HardwareScreen';
import TBar, { SBar } from './components/TBar';
import { API_BASE, FALLBACK_ROSTER } from './config';

const C = {
  teal: "#008080"
};

const T = {
  desk: { background: C.teal, minHeight: "100vh", display: "flex", flexDirection: "column", padding: 8, boxSizing: "border-box" },
  win: { background: "#c0c0c0", border: "2px solid", borderColor: "#fff #808080 #808080 #fff", flex: 1, display: "flex", flexDirection: "column", boxShadow: "2px 2px 0 #000", overflow: "hidden" },
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [staff, setStaff] = useState(null);
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState(null);
  const [offline, setOffline] = useState(false);
  const [roster, setRoster] = useState([]);
  const [storeConfig, setStoreConfig] = useState(null);

  // Load roster once on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/servers`)
      .then(r => r.json())
      .then(data => {
        setRoster(data.servers);
        setOffline(false);
      })
      .catch(() => {
        setRoster(FALLBACK_ROSTER);
        setOffline(true);
      });
  }, []);

  const handleLogin = useCallback((staffMember) => {
    setStaff(staffMember);
    setScreen('snapshot');
    
    // Fetch active orders + menu on login
    Promise.all([
      fetch(`${API_BASE}/api/v1/orders/active`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/menu`).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/config/store`).then(r => r.json()).catch(() => null),
    ])
      .then(([ordersData, menuData, configData]) => {
        setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.orders ?? []));
        setMenu(menuData.items_by_category);
        setStoreConfig(configData);
        setOffline(false);
      })
      .catch(() => {
        setOrders([]);
        setMenu(null);
        setStoreConfig(null);
        setOffline(true);
      });
  }, []);

  const goLogin = useCallback(() => {
    setStaff(null);
    setOrder(null);
    setPayment(null);
    setOrders([]);
    setMenu(null);
    setScreen('login');
  }, []);

  const goOrder = useCallback((ord) => {
    setOrder(ord);
    setScreen('order');
  }, []);

  const goReview = useCallback((ord) => {
    setOrder(ord);
    setScreen('review');
  }, []);

  const goPayment = useCallback((payload) => {
    setPayment(payload);
    setScreen('payment');
  }, []);

  const goComplete = useCallback(() => {
    if (payment?.order?.id) {
      setOrders(prev => prev.filter(o => o.id !== payment.order.id));
    }
    setOrder(null);
    setPayment(null);
    setScreen('snapshot');
  }, [payment]);

  const goSave = useCallback((updated) => {
    setOrders(prev => prev.some(o => o.id === updated.id)
      ? prev.map(o => o.id === updated.id ? updated : o)
      : [...prev, updated]
    );
    setScreen('snapshot');
  }, []);

  const getGreetingText = () => {
    if (!staff) return null;
    const h = new Date().getHours();
    const tod = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
    return `// ${tod}, ${staff.name}`;
  };

  return (
    <div style={T.desk}>
      <div style={T.win}>
        <TBar 
          greeting={screen !== "login" ? getGreetingText() : null} 
          role={staff?.role} 
          onLogout={screen !== "login" ? goLogin : null}
        />
        
        {screen === 'login' && (
          <LoginScreen onLogin={handleLogin} roster={roster} />
        )}
        
        {screen === 'snapshot' && (
          <SnapshotScreen
            staff={staff}
            orders={orders}
            setOrders={setOrders}
            onOpenOrder={goOrder}
            setOffline={setOffline}
            setScreen={setScreen}
            menu={menu}
          />
        )}
        
        {screen === 'order' && (
          <OrderScreen
            staff={staff}
            order={order}
            onPayment={goPayment}
            onReview={goReview}
            onSave={goSave}
            setOffline={setOffline}
          />
        )}
        
        {screen === 'review' && (
          <CheckOverviewScreen
            staff={staff}
            order={order}
            storeConfig={storeConfig}
            onPayment={goPayment}
            onBack={() => setScreen('order')}
            setOffline={setOffline}
          />
        )}

        {screen === 'payment' && (
          <PaymentScreen 
            staff={staff} 
            payload={payment} 
            onComplete={goComplete} 
            setOffline={setOffline}
          />
        )}

        {screen === 'close-day' && (
          <CloseDayScreen setScreen={setScreen} staff={staff} />
        )}

        {screen === 'batch-settle' && (
          <BatchSettleScreen setScreen={setScreen} />
        )}

        {screen === 'sales-reporting' && (
          <SalesReportingScreen setScreen={setScreen} staff={staff} />
        )}

        {screen === 'labor-reporting' && (
          <LaborReportingScreen setScreen={setScreen} />
        )}

        {screen === 'menu-config' && (
          <MenuConfigScreen setScreen={setScreen} />
        )}

        {screen === 'messenger' && (
          <MessengerScreen setScreen={setScreen} staff={staff} />
        )}

        {screen === 'hardware' && (
          <HardwareScreen setScreen={setScreen} staff={staff} />
        )}

        <SBar offline={offline} />
      </div>
    </div>
  );
}
