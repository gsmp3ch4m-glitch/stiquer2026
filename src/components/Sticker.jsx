import React from 'react';
import { motion } from 'framer-motion';

const DESIGNS = {
  star: <path d="M100 0 L115 45 L160 35 L145 80 L190 100 L145 120 L160 165 L115 155 L100 200 L85 155 L40 165 L55 120 L10 100 L55 80 L40 35 L85 45 Z" />,
  classic: <><rect x="5" y="5" width="190" height="190" rx="10" /><rect x="12" y="12" width="176" height="176" rx="8" strokeWidth="2" /></>,
  badge: <><circle cx="100" cy="100" r="95" strokeDasharray="8 4" /><circle cx="100" cy="100" r="85" strokeWidth="2" /></>,
  tag: <><path d="M10 50 L10 180 Q10 190 20 190 L180 190 Q190 190 190 180 L190 50 L140 10 L60 10 Z" /><circle cx="100" cy="30" r="8" strokeWidth="2" /></>,
  ribbon: <><path d="M10 40 L190 40 L190 160 L100 140 L10 160 Z" /><path d="M10 60 L190 60 M10 140 L190 140" strokeWidth="2" strokeDasharray="4 4" /></>
};

const Sticker = ({ data, design, isSelected, onClick, visuals, index }) => {
  const { title, price, features, mode, logo } = data;
  const { labelSize, labelY, priceSize, strokeColor, textColor } = visuals;

  const formatFeatures = (text) => {
    if (!text) return null;
    return (
      <ul className="tag-features-list" style={{ fontSize: `${priceSize * 0.35}px` }}>
        {text.split('\n').filter(l => l.trim()).map((line, i) => (
          <li key={i} style={{ marginBottom: '2px', position: 'relative', paddingLeft: '15px' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            {line.replace(/^\. ?/, '')}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ 
        delay: index * 0.03,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className={`tag-item mode-${mode} ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
      style={mode === 'student' ? { 
        background: visuals.student.gradient,
        borderRadius: '12px',
        overflow: 'hidden'
      } : {}}
    >
      {mode === 'student' ? (
        <div className="student-sticker-content" style={{ 
          color: '#fff', 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '12px',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          {/* Header / Institution */}
          <div className="student-header" style={{ 
            textAlign: 'center', 
            fontSize: `${visuals.student.fontSize * 0.8}px`,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '4px'
          }}>
            {visuals.student.institution || '___________________'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
            {/* Larger Image Section */}
            <div className="student-image-container" style={{ 
              flexShrink: 0, 
              width: '90px', 
              height: '90px', 
              borderRadius: '16px', 
              border: `3px solid rgba(255,255,255,0.8)`, 
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)', 
              overflow: 'hidden', 
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src={visuals.student.image || '/assets/subjects/student_general.png'} alt="subject" style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
            </div>

            {/* Data Section with Glassmorphism */}
            <div className="student-data glass-effect" style={{ 
              flex: 1, 
              textAlign: 'left', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '6px',
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div className="data-line">
                <span style={{ fontWeight: 800, fontSize: '9px', opacity: 0.8, display: 'block' }}>ASIGNATURA:</span>
                <div style={{ 
                  borderBottom: '1.5px solid rgba(255,255,255,0.6)', 
                  minHeight: '1.4em', 
                  fontSize: `${visuals.student.subjectSize}px`, 
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1.1,
                  marginTop: '0px'
                }}>
                  {visuals.student.subject || '___________________'}
                </div>
              </div>
              <div className="data-line">
                <span style={{ fontWeight: 800, fontSize: '9px', opacity: 0.8, display: 'block' }}>NOMBRE:</span>
                <div style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.4)', 
                  minHeight: '1.2em', 
                  fontSize: `${visuals.student.fontSize}px`, 
                  fontWeight: 600 
                }}>
                  {visuals.student.name || '___________________'}
                </div>
              </div>
              <div className="data-line">
                <span style={{ fontWeight: 800, fontSize: '9px', opacity: 0.8, display: 'block' }}>GRADO:</span>
                <div style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.4)', 
                  minHeight: '1.2em', 
                  fontSize: `${visuals.student.fontSize}px`, 
                  fontWeight: 600 
                }}>
                  {visuals.student.grade || '___________________'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <svg 
            className="tag-svg" 
            viewBox="0 0 200 200" 
            preserveAspectRatio="none"
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinejoin="round"
          >
            {DESIGNS[design]}
          </svg>
          <div className="tag-content" style={{ color: textColor }}>
            {logo && <img src={logo} alt="logo" className="tag-logo" />}
            <div 
              className="tag-label" 
              style={{ 
                fontSize: `${labelSize}px`,
                transform: `translateY(${labelY}px)`
              }}
            >
              {title}
            </div>
            {mode === 'price' ? (
              <div className="tag-price-container" style={{ fontSize: `${priceSize}px`, lineHeight: 1 }}>
                <span className="tag-currency" style={{ fontSize: '0.4em' }}>S/</span>
                <span className="tag-price">{price}</span>
              </div>
            ) : (
              <div className="tag-features">
                {formatFeatures(features)}
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Sticker;
