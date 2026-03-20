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
        overflow: 'hidden',
        position: 'relative',
        border: `4px solid ${visuals.student.accentColor || '#3b82f6'}`,
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      } : {}}
    >
      {mode === 'student' && (
        <div className="sun-effect" style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
          filter: 'blur(20px)',
          pointerEvents: 'none',
          zIndex: 1
        }} />
      )}
      {mode === 'student' && (
        <div className="bubbles-container" style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.4
        }}>
           <div style={{ position: 'absolute', top: '10%', left: '5%', width: '15px', height: '15px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
           <div style={{ position: 'absolute', top: '60%', left: '20%', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
           <div style={{ position: 'absolute', top: '30%', right: '25%', width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
        </div>
      )}
      {mode === 'student' ? (
        <div className="student-sticker-content" style={{ 
          color: visuals.student.textColor || '#fff', 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '8px',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact'
        }}>
          {/* Institution Header */}
          <div style={{ 
            textAlign: 'center', 
            fontSize: `${visuals.student.fontSize * 0.7}px`,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '4px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}>
            {visuals.student.institution || 'INSTITUCIÓN'}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flex: 1, 
            minHeight: 0,
            alignItems: 'center'
          }}>
            {/* Foto Container */}
            <div style={{ 
              width: '40%',
              height: '85%',
              borderRadius: visuals.student.imageShape === 'round' ? '50%' : '6px', 
              overflow: 'hidden',
              border: '3px solid #fff',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              flexShrink: 0
            }}>
              <img 
                src={visuals.student.image || '/assets/subjects/student_general.png'} 
                alt="student" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>

            {/* Data Box - simplified for print */}
            <div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '4px',
              padding: '6px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              minWidth: 0,
              height: '85%',
              WebkitPrintColorAdjust: 'exact'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.8 }}>CURSO</span>
                <div style={{ 
                  fontSize: `${visuals.student.subjectSize * 0.9}px`, 
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  maxHeight: '2em',
                  overflow: 'hidden'
                }}>
                  {visuals.student.subject || 'CURSO'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.8 }}>ALUMNO</span>
                <div style={{ 
                  fontSize: `${visuals.student.fontSize * 0.9}px`, 
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {visuals.student.name || 'NOMBRE'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '7px', fontWeight: 900, opacity: 0.8 }}>GRADO</span>
                <div style={{ 
                  fontSize: `${visuals.student.fontSize * 0.9}px`, 
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {visuals.student.grade || 'GRADO'}
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
