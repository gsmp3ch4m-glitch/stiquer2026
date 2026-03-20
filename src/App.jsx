import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, RefreshCcw, Trash2, Image as ImageIcon, Sparkles,
  Save, FolderOpen, Menu, X, ChevronDown, Settings, Type,
  Grid, Sliders, GraduationCap, FileText, CheckCircle, AlertCircle, Info
} from 'lucide-react';
import { db } from './firebase/config';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Sticker from './components/Sticker';
import ImageCropper from './components/ImageCropper';

/* ─── Toast ─────────────────────────────────────────────── */
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
};

const ToastIcon = ({ type }) => {
  if (type === 'success') return <CheckCircle size={15} />;
  if (type === 'error')   return <AlertCircle size={15} />;
  return <Info size={15} />;
};

/* ─── Accordion ─────────────────────────────────────────── */
const Accordion = ({ icon: Icon, label, badge, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <button className="accordion-trigger" onClick={() => setOpen(v => !v)}>
        <span className="accordion-trigger-icon"><Icon size={14} /></span>
        <span className="accordion-trigger-label">{label}</span>
        {badge && <span className="accordion-trigger-badge">{badge}</span>}
        <ChevronDown size={14} className={`accordion-chevron ${open ? 'open' : ''}`} />
      </button>
      <div className={`accordion-body ${open ? '' : 'collapsed'}`}>{children}</div>
    </div>
  );
};

/* ─── SliderField ───────────────────────────────────────── */
const SliderField = ({ label, value, min, max, onChange }) => (
  <div className="slider-field">
    <div className="slider-header">
      <span className="slider-label">{label}</span>
      <span className="slider-value">{value}px</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} />
  </div>
);

/* ─── Data ──────────────────────────────────────────────── */
const SUBJECTS = [
  { id: 'math',     name: 'Matemáticas', image: '/assets/subjects/math.png',     gradient: 'linear-gradient(135deg,#0ea5e9 0%,#2563eb 100%)', accent: '#0ea5e9' },
  { id: 'science',  name: 'Ciencias',    image: '/assets/subjects/science.png',   gradient: 'linear-gradient(135deg,#22c55e 0%,#15803d 100%)', accent: '#22c55e' },
  { id: 'art',      name: 'Arte',        image: '/assets/subjects/art.png',       gradient: 'linear-gradient(135deg,#d946ef 0%,#a21caf 100%)', accent: '#d946ef' },
  { id: 'history',  name: 'Historia',    image: '/assets/subjects/history.png',   gradient: 'linear-gradient(135deg,#f59e0b 0%,#b45309 100%)', accent: '#f59e0b' },
  { id: 'language', name: 'Lenguaje',    image: '/assets/subjects/language.png',  gradient: 'linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)', accent: '#ef4444' },
];

const GRID_OPTIONS = [1, 2, 4, 6, 8, 12, 15];
const DESIGN_OPTIONS = [
  { value: 'star',    label: 'Estrella' },
  { value: 'classic', label: 'Clásico' },
  { value: 'badge',   label: 'Circular' },
  { value: 'tag',     label: 'Etiqueta' },
  { value: 'ribbon',  label: 'Cinta' },
];

/* ─── App ───────────────────────────────────────────────── */
const App = () => {
  const { toasts, show: toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      subject: '', name: '', grade: '', institution: '',
      image: '', gradient: 'linear-gradient(135deg,#60a5fa 0%,#2563eb 100%)',
      accentColor: '#3b82f6', fontSize: 14, subjectSize: 18,
      textColor: '#ffffff', imageShape: 'rect'
    }
  });

  const [tags, setTags] = useState([]);
  const [cropper, setCropper] = useState({ active: false, image: null });

  useEffect(() => {
    const total = config.gridCount * config.pageCount;
    setTags(prev => Array.from({ length: total }).map((_, i) => prev[i] ?? {
      id: i, title: config.title, price: config.price,
      features: config.features, mode: config.mode,
      logo: config.logo, student: { ...config.student }
    }));
  }, [config.gridCount, config.pageCount]);

  const updateAll = (key, val) => {
    if (key === 'mode') {
      setConfig(prev => ({ ...prev, [key]: val, gridCount: val === 'student' ? 8 : prev.gridCount }));
      setTags(prev => prev.map(t => ({ ...t, [key]: val, student: { ...config.student } })));
      return;
    }
    setConfig(prev => ({ ...prev, [key]: val }));
    if (config.selectedId === 'all') {
      setTags(prev => prev.map(t => ({ ...t, [key]: val })));
    } else {
      setTags(prev => prev.map(t => t.id === config.selectedId ? { ...t, [key]: val } : t));
    }
  };

  const updateStudent = (key, val) => {
    if (config.selectedId === 'all') {
      setConfig(prev => ({ ...prev, student: { ...prev.student, [key]: val } }));
      setTags(prev => prev.map(t => ({ ...t, student: { ...t.student, [key]: val } })));
    } else {
      setTags(prev => prev.map(t => t.id === config.selectedId
        ? { ...t, student: { ...t.student, [key]: val } } : t));
    }
  };

  const selectedStudentVal = (key, fallback) => {
    if (config.selectedId === 'all') return config.student[key] ?? fallback;
    return tags.find(t => t.id === config.selectedId)?.student?.[key] ?? fallback;
  };

  const savePreset = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'sticker_presets'), { ...config, timestamp: new Date() });
      toast('Diseño guardado correctamente', 'success');
    } catch (e) {
      console.error(e);
      toast('Error al guardar el diseño', 'error');
    }
    setLoading(false);
  };

  const loadLastPreset = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'sticker_presets'), orderBy('timestamp', 'desc'), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setConfig(snap.docs[0].data());
        toast('Último diseño cargado', 'success');
      } else {
        toast('No hay diseños guardados', 'info');
      }
    } catch (e) {
      console.error(e);
      toast('Error al cargar', 'error');
    }
    setLoading(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (config.mode === 'student') {
        setCropper({ active: true, image: reader.result });
      } else {
        updateAll('logo', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (img) => {
    updateStudent('image', img);
    setCropper({ active: false, image: null });
  };

  const applySubjectTemplate = (s) => {
    const data = { subject: s.name, image: s.image, gradient: s.gradient, accentColor: s.accent };
    if (config.selectedId === 'all') {
      setConfig(prev => ({ ...prev, student: { ...prev.student, ...data } }));
      setTags(prev => prev.map(t => ({ ...t, student: { ...t.student, ...data } })));
    } else {
      setTags(prev => prev.map(t => t.id === config.selectedId
        ? { ...t, student: { ...t.student, ...data } } : t));
    }
  };

  const resetTags = () => {
    setTags(prev => prev.map(t => ({ ...t, title: '¡OFERTA!', price: '9.90', features: '. ', logo: null })));
    toast('Etiquetas restablecidas', 'info');
  };

  const clearAll = () => {
    updateAll('title', '');
    toast('Contenido borrado', 'info');
  };

  /* ─── Sidebar Content ─── */
  const SidebarContent = () => (
    <>
      {/* Preset Actions */}
      <Accordion icon={Settings} label="Presets & Herramientas" defaultOpen>
        <div className="field">
          <label>Objetivo de edición</label>
          <select
            value={config.selectedId}
            onChange={e => setConfig(prev => ({
              ...prev,
              selectedId: e.target.value === 'all' ? 'all' : parseInt(e.target.value)
            }))}
          >
            <option value="all">Todas las etiquetas ({tags.length})</option>
            {tags.map((t, i) => (
              <option key={t.id} value={t.id}>
                Etiqueta {i + 1}{t.student?.name ? ` — ${t.student.name}` : ''}
              </option>
            ))}
          </select>
        </div>

        {config.mode !== 'student' && (
          <div className="field">
            <label>Logo / Imagen</label>
            <label className="btn-upload">
              <ImageIcon size={14} />
              {config.logo ? 'Cambiar logo' : 'Subir logo'}
              <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
            </label>
          </div>
        )}

        <div className="btn-grid">
          <button className="btn-secondary btn-accent" onClick={savePreset} disabled={loading}>
            <Save size={13} /> Guardar
          </button>
          <button className="btn-secondary" onClick={loadLastPreset} disabled={loading}>
            <FolderOpen size={13} /> Cargar
          </button>
          <button className="btn-secondary" onClick={resetTags}>
            <RefreshCcw size={13} /> Reset
          </button>
          <button className="btn-secondary" onClick={clearAll}>
            <Trash2 size={13} /> Vaciar
          </button>
        </div>
      </Accordion>

      {/* Content */}
      <Accordion icon={Type} label="Contenido" defaultOpen>
        <div className="field">
          <label>Modo</label>
          <div className="mode-tabs">
            {[['price','Precio'],['features','Características'],['student','Estudiante']].map(([v,l]) => (
              <button key={v} className={`mode-tab ${config.mode === v ? 'active' : ''}`} onClick={() => updateAll('mode', v)}>{l}</button>
            ))}
          </div>
        </div>

        {config.mode !== 'student' && (
          <div className="field">
            <label>Texto superior</label>
            <input type="text" value={config.title} onChange={e => updateAll('title', e.target.value)} />
          </div>
        )}
        {config.mode === 'price' && (
          <div className="field">
            <label>Precio</label>
            <input type="text" value={config.price} onChange={e => updateAll('price', e.target.value)} />
          </div>
        )}
        {config.mode === 'features' && (
          <div className="field">
            <label>Características (una por línea)</label>
            <textarea value={config.features} onChange={e => updateAll('features', e.target.value)} />
          </div>
        )}
      </Accordion>

      {/* Student */}
      {config.mode === 'student' && (
        <Accordion icon={GraduationCap} label="Datos del Estudiante" defaultOpen>
          <div className="field">
            <label>Plantillas rápidas</label>
            <div className="subjects-gallery">
              {SUBJECTS.map(s => (
                <div
                  key={s.id}
                  className={`subject-item ${selectedStudentVal('subject','') === s.name ? 'active' : ''}`}
                  onClick={() => applySubjectTemplate(s)}
                >
                  <img src={s.image} alt={s.name} />
                </div>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Asignatura / Curso</label>
            <input
              type="text" placeholder="Ej: Matemáticas"
              value={selectedStudentVal('subject', '')}
              onChange={e => updateStudent('subject', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Nombre del estudiante</label>
            <input
              type="text" placeholder="Ej: Juan Pérez"
              value={selectedStudentVal('name', '')}
              onChange={e => updateStudent('name', e.target.value)}
            />
          </div>
          <div className="row">
            <div className="field">
              <label>Grado / Aula</label>
              <input
                type="text" placeholder="5to Primaria"
                value={selectedStudentVal('grade', '')}
                onChange={e => updateStudent('grade', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Institución</label>
              <input
                type="text" placeholder="I.E. San Juan"
                value={selectedStudentVal('institution', '')}
                onChange={e => updateStudent('institution', e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Foto del estudiante</label>
            <div className="row">
              <label className="btn-upload" style={{ flex: 2 }}>
                <ImageIcon size={13} />
                {selectedStudentVal('image', '') ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
              </label>
              <div className="field" style={{ flex: 1, gap: 0 }}>
                <select
                  value={selectedStudentVal('imageShape', 'rect')}
                  onChange={e => updateStudent('imageShape', e.target.value)}
                >
                  <option value="rect">Cuadrada</option>
                  <option value="round">Circular</option>
                </select>
              </div>
            </div>
          </div>

          <div className="color-pair">
            <div className="color-field">
              <label>Color fondo</label>
              <input
                type="color"
                value={selectedStudentVal('accentColor', '#3b82f6')}
                onChange={e => {
                  const c = e.target.value;
                  updateStudent('accentColor', c);
                  updateStudent('gradient', `linear-gradient(135deg,${c}bb 0%,${c} 100%)`);
                }}
              />
            </div>
            <div className="color-field">
              <label>Color texto</label>
              <input
                type="color"
                value={selectedStudentVal('textColor', '#ffffff')}
                onChange={e => updateStudent('textColor', e.target.value)}
              />
            </div>
          </div>
        </Accordion>
      )}

      {/* Design & Grid */}
      <Accordion icon={Grid} label="Diseño y Grilla">
        <div className="field">
          <label>Estilo de sticker</label>
          <select value={config.design} onChange={e => setConfig(prev => ({ ...prev, design: e.target.value }))}>
            {DESIGN_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="row">
          <div className="field">
            <label>Hojas A4</label>
            <select value={config.pageCount} onChange={e => setConfig(prev => ({ ...prev, pageCount: parseInt(e.target.value) }))}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?'hoja':'hojas'}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Por hoja</label>
            <select value={config.gridCount} onChange={e => setConfig(prev => ({ ...prev, gridCount: parseInt(e.target.value) }))}>
              {GRID_OPTIONS.map(n => <option key={n} value={n}>{n}{n===15?' (std)':''}</option>)}
            </select>
          </div>
        </div>
      </Accordion>

      {/* Visual Adjustments */}
      {config.mode !== 'student' && (
        <Accordion icon={Sliders} label="Ajustes Visuales">
          <SliderField label="Tamaño título" value={config.labelSize} min={10} max={80} onChange={v => setConfig(prev => ({ ...prev, labelSize: v }))} />
          <SliderField label="Tamaño precio" value={config.priceSize} min={20} max={250} onChange={v => setConfig(prev => ({ ...prev, priceSize: v }))} />
          <div className="color-pair">
            <div className="color-field">
              <label>Borde</label>
              <input type="color" value={config.strokeColor} onChange={e => setConfig(prev => ({ ...prev, strokeColor: e.target.value }))} />
            </div>
            <div className="color-field">
              <label>Texto</label>
              <input type="color" value={config.textColor} onChange={e => setConfig(prev => ({ ...prev, textColor: e.target.value }))} />
            </div>
          </div>
        </Accordion>
      )}

      {config.mode === 'student' && (
        <Accordion icon={Sliders} label="Tamaños de Texto">
          <SliderField
            label="Fuente base" value={selectedStudentVal('fontSize', 14)} min={8} max={24}
            onChange={v => updateStudent('fontSize', v)}
          />
          <SliderField
            label="Asignatura" value={selectedStudentVal('subjectSize', 18)} min={12} max={40}
            onChange={v => updateStudent('subjectSize', v)}
          />
        </Accordion>
      )}
    </>
  );

  return (
    <div className="app-container">
      {/* Sidebar (desktop always visible, mobile drawer) */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <Sparkles size={20} color="#3b82f6" />
            <h1>Stiquer Pro</h1>
          </div>
          <p className="sidebar-subtitle">Generador de etiquetas 2026</p>
        </div>

        <div className="sidebar-body">
          <SidebarContent />
        </div>

        <div className="sidebar-footer">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="btn-primary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimir {config.pageCount} {config.pageCount === 1 ? 'hoja' : 'hojas'}
          </motion.button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-brand">
          <Sparkles size={18} color="#3b82f6" />
          Stiquer Pro
        </div>
        <div className="topbar-actions">
          <button className="icon-btn accent" onClick={() => window.print()} title="Imprimir">
            <Printer size={18} />
          </button>
          <button className="icon-btn" onClick={() => setSidebarOpen(true)} title="Configurar">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Close Button inside sidebar */}
      {sidebarOpen && (
        <button
          className="close-btn"
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 2100, background: 'rgba(255,255,255,0.08)', padding: 8 }}
        >
          <X size={20} />
        </button>
      )}

      {/* Preview Area */}
      <main className="preview-area">
        <div className="preview-header">
          <span className="preview-label">Vista previa</span>
          <span className="preview-badge">
            <FileText size={12} />
            {config.pageCount} {config.pageCount === 1 ? 'hoja' : 'hojas'} · {tags.length} etiquetas
          </span>
        </div>

        <div className="pages-container">
          {Array.from({ length: config.pageCount }).map((_, pageIdx) => (
            <div key={pageIdx} className="a4-wrapper">
              {config.pageCount > 1 && (
                <div className="a4-page-label">Hoja {pageIdx + 1}</div>
              )}
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: pageIdx * 0.08 }}
                className="a4-page"
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
                          student: tag.student || config.student
                        }}
                        index={idx}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </main>

      {/* Image Cropper */}
      <AnimatePresence>
        {cropper.active && (
          <ImageCropper
            image={cropper.image}
            shape={config.selectedId === 'all'
              ? config.student.imageShape
              : (tags.find(t => t.id === config.selectedId)?.student?.imageShape || 'rect')}
            onCropComplete={handleCropComplete}
            onCancel={() => setCropper({ active: false, image: null })}
          />
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={`toast ${t.type}`}
            >
              <ToastIcon type={t.type} />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
