import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, RefreshCcw, Trash2, Image as ImageIcon, Sparkles, Save, FolderOpen } from 'lucide-react';
import { db } from './firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Sticker from './components/Sticker';

const App = () => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    title: '¡OFERTA!',
    price: '9.90',
    features: '. Algodón 100%\n. Diseño exclusivo',
    mode: 'price',
    design: 'star',
    gridCount: 15,
    selectedId: 'all',
    labelSize: 14,
    labelY: 0,
    priceSize: 48,
    strokeColor: '#000000',
    textColor: '#000000',
    logo: null,
    pageCount: 1,
    student: {
      subject: '',
      name: '',
      grade: '',
      image: '',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      accentColor: '#3b82f6'
    }
  });

  const SUBJECTS = [
    { 
      id: 'math', 
      name: 'Matemáticas', 
      image: '/assets/subjects/math.png', 
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
      accent: '#0ea5e9'
    },
    { 
      id: 'science', 
      name: 'Ciencias', 
      image: '/assets/subjects/science.png', 
      gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      accent: '#22c55e'
    },
    { 
      id: 'art', 
      name: 'Arte', 
      image: '/assets/subjects/art.png', 
      gradient: 'linear-gradient(135deg, #d946ef 0%, #a21caf 100%)',
      accent: '#d946ef'
    },
    { 
      id: 'history', 
      name: 'Historia', 
      image: '/assets/subjects/history.png', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
      accent: '#f59e0b'
    },
    { 
      id: 'language', 
      name: 'Lenguaje', 
      image: '/assets/subjects/language.png', 
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      accent: '#ef4444'
    }
  ];

  const [tags, setTags] = useState([]);

  useEffect(() => {
    const totalCount = config.gridCount * config.pageCount;
    const newTags = Array.from({ length: totalCount }).map((_, i) => ({
      id: i,
      title: config.title,
      price: config.price,
      features: config.features,
      mode: config.mode,
      logo: config.logo
    }));
    setTags(newTags);
  }, [config.gridCount, config.pageCount]);

  const updateAll = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    if (config.selectedId === 'all') {
      setTags(prev => prev.map(t => ({ ...t, [key]: val })));
    } else {
      setTags(prev => prev.map(t => t.id === config.selectedId ? { ...t, [key]: val } : t));
    }
  };

  const savePreset = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'sticker_presets'), {
        ...config,
        timestamp: new Date()
      });
      alert('Diseño guardado en Firebase!');
    } catch (e) {
      console.error(e);
      alert('Error al guardar');
    }
    setLoading(false);
  };

  const loadLastPreset = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'sticker_presets'), orderBy('timestamp', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setConfig(data);
        alert('Último diseño cargado!');
      } else {
        alert('No hay diseños guardados');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAll('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="app-container">
      <motion.aside 
        initial={{ x: -380 }} 
        animate={{ x: 0 }} 
        className="sidebar"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Sparkles className="text-blue-500" size={24} color="#3b82f6" />
          <h1>Stiquer Pro</h1>
        </div>
        <p>Experiencia dinámica 2026</p>

        <div className="control-section">
          <h3>Personalización Pro</h3>
          <div className="input-group">
            <div className="field">
              <label>Objetivo</label>
              <select 
                value={config.selectedId} 
                onChange={(e) => setConfig(prev => ({ ...prev, selectedId: e.target.value === 'all' ? 'all' : parseInt(e.target.value) }))}
              >
                <option value="all">Todas las etiquetas</option>
                {tags.map(t => (
                  <option key={t.id} value={t.id}>Etiqueta {t.id + 1}</option>
                ))}
              </select>
            </div>
            
            <div className="field">
              <label>Logo / Imagen</label>
              <label className="secondary-button" style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                <ImageIcon size={16} style={{ marginRight: '8px' }} /> 
                {config.logo ? 'Cambiar Logo' : 'Subir Imagen'}
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="row">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="secondary-button" style={{ flex: 1, background: 'rgba(59, 130, 246, 0.2)' }} 
                onClick={savePreset}
                disabled={loading}
              >
                <Save size={14} /> Guardar
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="secondary-button" style={{ flex: 1 }} 
                onClick={loadLastPreset}
                disabled={loading}
              >
                <FolderOpen size={14} /> Cargar
              </motion.button>
            </div>

            <div className="row">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="secondary-button" style={{ flex: 1 }} 
                onClick={() => setTags(tags.map(t => ({ ...t, title: '¡OFERTA!', price: '9.90', features: '. ', logo: null })))}
              >
                <RefreshCcw size={14} /> Reset
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="secondary-button" style={{ flex: 1 }} 
                onClick={() => updateAll('title', '')}
              >
                <Trash2 size={14} /> Vaciar
              </motion.button>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Contenido</h3>
          <div className="input-group">
            <div className="field">
              <label>Modo</label>
              <div className="row">
                <label className="radio-label" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <input type="radio" checked={config.mode === 'price'} onChange={() => updateAll('mode', 'price')} /> Precio
                </label>
                <label className="radio-label" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <input type="radio" checked={config.mode === 'features'} onChange={() => updateAll('mode', 'features')} /> Características
                </label>
                <label className="radio-label" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                  <input type="radio" checked={config.mode === 'student'} onChange={() => updateAll('mode', 'student')} /> Estudiante
                </label>
              </div>
            </div>
            {config.mode !== 'student' && (
              <div className="field">
                <label>Texto Superior</label>
                <input type="text" value={config.title} onChange={(e) => updateAll('title', e.target.value)} />
              </div>
            )}
            {config.mode === 'price' && (
              <div className="field">
                <label>Precio</label>
                <input type="text" value={config.price} onChange={(e) => updateAll('price', e.target.value)} />
              </div>
            )}
            {config.mode === 'features' && (
              <div className="field">
                <label>Características</label>
                <textarea value={config.features} onChange={(e) => updateAll('features', e.target.value)} />
              </div>
            )}

            {config.mode === 'student' && (
              <div className="student-controls" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div className="field">
                  <label>Asignatura / Curso</label>
                  <input 
                    type="text" 
                    placeholder="Eje: Matemáticas"
                    value={config.student.subject} 
                    onChange={(e) => setConfig(prev => ({ ...prev, student: { ...prev.student, subject: e.target.value } }))} 
                  />
                </div>
                <div className="field">
                  <label>Nombre del Estudiante</label>
                  <input 
                    type="text" 
                    placeholder="Eje: Juan Pérez"
                    value={config.student.name} 
                    onChange={(e) => setConfig(prev => ({ ...prev, student: { ...prev.student, name: e.target.value } }))} 
                  />
                </div>
                <div className="field">
                  <label>Grado / Aula</label>
                  <input 
                    type="text" 
                    placeholder="Eje: 5to Primaria"
                    value={config.student.grade} 
                    onChange={(e) => setConfig(prev => ({ ...prev, student: { ...prev.student, grade: e.target.value } }))} 
                  />
                </div>
                <div className="field">
                  <label>Plantillas Rápidas</label>
                  <div className="subjects-gallery" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {SUBJECTS.map(s => (
                      <motion.div
                        key={s.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setConfig(prev => ({
                          ...prev,
                          student: {
                            ...prev.student,
                            subject: s.name,
                            image: s.image,
                            gradient: s.gradient,
                            accentColor: s.accent
                          }
                        }))}
                        style={{ 
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: config.student.subject === s.name ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '4px'
                        }}
                      >
                        <img src={s.image} alt={s.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="row">
                   <div className="field" style={{ flex: 1 }}>
                    <label>Fondo G.</label>
                    <input 
                      type="color" 
                      value={config.student.accentColor} 
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        student: { 
                          ...prev.student, 
                          accentColor: e.target.value,
                          gradient: `linear-gradient(135deg, ${e.target.value}bb 0%, ${e.target.value} 100%)`
                        } 
                      }))} 
                      style={{ width: '100%', height: '40px', padding: 2 }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="control-section">
          <h3>Diseño y Grilla</h3>
          <div className="input-group">
            <div className="field">
              <label>Estilo de Sticker</label>
              <select value={config.design} onChange={(e) => setConfig(prev => ({ ...prev, design: e.target.value }))}>
                <option value="star">Estrella (Explosión)</option>
                <option value="classic">Clásico Rectangular</option>
                <option value="badge">Placa Circular</option>
                <option value="tag">Etiqueta</option>
                <option value="ribbon">Cinta / Banner</option>
              </select>
            </div>
            <div className="field">
              <label>Cantidad de Hojas A4</label>
              <select value={config.pageCount} onChange={(e) => setConfig(prev => ({ ...prev, pageCount: parseInt(e.target.value) }))}>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Hoja' : 'Hojas'}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Etiquetas por hoja</label>
              <select value={config.gridCount} onChange={(e) => setConfig(prev => ({ ...prev, gridCount: parseInt(e.target.value) }))}>
                {[1, 2, 4, 6, 8, 12, 15].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Gigante' : n === 15 ? '(Estándar)' : ''}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>Ajustes Visuales</h3>
          <div className="input-group">
            <div className="field">
              <label>Tamaño Título: {config.labelSize}px</label>
              <input type="range" min="10" max="80" value={config.labelSize} onChange={(e) => setConfig(prev => ({ ...prev, labelSize: parseInt(e.target.value) }))} />
            </div>
            <div className="field">
              <label>Tamaño Precio: {config.priceSize}px</label>
              <input type="range" min="20" max="250" value={config.priceSize} onChange={(e) => setConfig(prev => ({ ...prev, priceSize: parseInt(e.target.value) }))} />
            </div>
            <div className="row">
               <div className="field" style={{ flex: 1 }}>
                <label>Borde</label>
                <input type="color" value={config.strokeColor} onChange={(e) => setConfig(prev => ({ ...prev, strokeColor: e.target.value }))} style={{ width: '100%', height: '40px', padding: 2 }} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>Texto</label>
                <input type="color" value={config.textColor} onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))} style={{ width: '100%', height: '40px', padding: 2 }} />
              </div>
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="primary-button" 
          onClick={handlePrint} 
          style={{ width: '100%', marginTop: '20px' }}
        >
          <Printer size={18} /> Imprimir {config.pageCount} Hojas
        </motion.button>
      </motion.aside>

      <main className="preview-area">
        <div className="pages-container" style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
          {Array.from({ length: config.pageCount }).map((_, pageIdx) => (
            <motion.div 
              key={pageIdx}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 0.9 }}
              transition={{ duration: 0.5, delay: pageIdx * 0.1 }}
              className="a4-page"
              style={{ flexShrink: 0 }}
            >
              <div className={`tags-grid grid-${config.gridCount}`}>
                <AnimatePresence mode="popLayout">
                  {tags.slice(pageIdx * config.gridCount, (pageIdx + 1) * config.gridCount).map((tag, idx) => (
                    <Sticker 
                      key={`${tag.id}-${config.gridCount}-${config.pageCount}`}
                      data={tag}
                      design={config.design}
                      isSelected={config.selectedId === tag.id}
                      onClick={() => setConfig(prev => ({ ...prev, selectedId: tag.id }))}
                      visuals={{
                        labelSize: config.labelSize,
                        labelY: config.labelY,
                        priceSize: config.priceSize,
                        strokeColor: config.strokeColor,
                        textColor: config.textColor,
                        student: config.student
                      }}
                      index={idx}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
