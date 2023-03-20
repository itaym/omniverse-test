import React from 'react';
import Header from './components/Header'
import MainPage from './pages/MainPage'
import { store } from './redux/store'
import './App.css';
import { Provider, connect } from 'react-redux'

function App() {
  return (
    <div className="App">
      <Header className="App-header" />
        <Provider store={store}>
            <MainPage />
        </Provider>
    </div>
  );
}

export default App;
