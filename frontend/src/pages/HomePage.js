import React, { useState } from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import JobAnalyzer from '../components/JobAnalyzer';
import PastAnalysis from '../components/PastAnalysis';
import '../styles/HomePage.css';

const HomePage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' or 'history'

  return (
    <div className="homepage">
      <Header user={user} onLogout={onLogout} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'analyzer' ? (
          <JobAnalyzer />
        ) : (
          <PastAnalysis />
        )}
      </main>
    </div>
  );
};

export default HomePage;