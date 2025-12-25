import React, { useEffect, useMemo, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FaBookOpen, FaEdit, FaTrash, FaLock, FaLockOpen, FaTimes } from 'react-icons/fa';
import ConfirmModal from '../components/ConfirmModal';

interface SagaType {
  id: number;
  name: string;
  description: string;
}

const API_URL = 'http://localhost:4000/sagas';

const SagaPanel: React.FC = () => {
  const [sagas, setSagas] = useState<SagaType[]>([]);
  const [form, setForm] = useState<Partial<SagaType>>({ name: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  async function fetchSagas() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setSagas(data || []);
    } catch (err) {
      console.error('Error fetching sagas', err);
    }
  }

  useEffect(() => {
    fetchSagas();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = async (event: any) => {
    setIsDragging(false);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sagas.findIndex(s => s.id === Number(active.id));
    const newIndex = sagas.findIndex(s => s.id === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(sagas, oldIndex, newIndex);
    setSagas(reordered);
    const ids = reordered.map((s: SagaType) => Number(s.id));
    try {
      await fetch(`${API_URL}/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
    } catch (err) {
      console.error('Error reordenando sagas', err);
    }
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { ids, ...formData } = (form as any);
      if (editingId !== null) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        setEditingId(null);
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setForm({ name: '', description: '' });
      setShowModal(false);
      fetchSagas();
    } catch (err) {
      console.error('Error saving saga', err);
    }
  }

  async function handleDelete(id: number) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchSagas();
    } catch (err) {
      console.error('Error deleting saga', err);
    }
  }

  const nameCounts = useMemo(() => {
    const map: Record<string, number> = {};
    sagas.forEach((s) => {
      const key = (s.name || '').trim().toLowerCase();
      if (!key) return;
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [sagas]);

  const filteredSagas = search.trim()
    ? sagas.filter(s =>
        s.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (s.description || '').toLowerCase().includes(search.trim().toLowerCase())
      )
    : sagas;

  return (
    <div className="panel">
      <div className="panel-header">
        <h1>CRUD de Sagas</h1>
        <button
          className="icon"
          aria-label="Nueva Saga"
          title="Nueva Saga"
          onClick={() => {
            setShowModal(true);
            setEditingId(null);
            setForm({ name: '', description: '' });
          }}
        >
          <FaBookOpen size={28} color="#FFD700" />
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar saga..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={isDragging}
          style={{ flex: 1, padding: 8 }}
        />
        <button
          className="icon"
          type="button"
          aria-label={dndEnabled ? 'Deshabilitar drag and drop' : 'Habilitar drag and drop'}
          title={dndEnabled ? 'Deshabilitar drag and drop' : 'Habilitar drag and drop'}
          onClick={() => setDndEnabled((prev) => !prev)}
          style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {dndEnabled ? <FaLockOpen size={22} color="#FFD700" title="Drag and drop habilitado" /> : <FaLock size={22} color="#FFD700" title="Drag and drop deshabilitado" />}
        </button>
      </div>
      {dndEnabled && search.trim() === '' ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredSagas.map((s) => s.id.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div className="saga-list">
              {filteredSagas.map((saga, index) => (
                <SortableSagaCard
                  key={saga.id}
                  saga={saga}
                  index={index}
                  nameCounts={nameCounts}
                  onEdit={() => {
                    setEditingId(saga.id);
                    setForm({
                      name: saga.name,
                      description: saga.description,
                    });
                    setShowModal(true);
                  }}
                  onDelete={() => {
                    setPendingDeleteId(saga.id);
                    setConfirmOpen(true);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="saga-list">
          {filteredSagas.map((saga, index) => (
            <SortableSagaCard
              key={saga.id}
              saga={saga}
              index={index}
              nameCounts={nameCounts}
              onEdit={() => {
                setEditingId(saga.id);
                setForm({
                  name: saga.name,
                  description: saga.description,
                });
                setShowModal(true);
              }}
              onDelete={() => {
                setPendingDeleteId(saga.id);
                setConfirmOpen(true);
              }}
            />
          ))}
        </div>
      )}
      <ConfirmModal
        open={confirmOpen}
        message={"¿Estás seguro de que deseas eliminar esta saga?"}
        onConfirm={() => {
          if (pendingDeleteId !== null) {
            handleDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }
          setConfirmOpen(false);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="icon option" onClick={() => setShowModal(false)} title="Cerrar">
              <FaTimes size={18} />
            </button>
            <h2 className="modal-title">
              {editingId ? 'Editar Saga' : 'Nueva Saga'}
            </h2>
            <form onSubmit={handleSubmit} autoComplete="off">
              <input
                name="name"
                placeholder="Name"
                value={form.name || ''}
                onChange={handleChange}
                required
                autoComplete="off"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={form.description || ''}
                onChange={handleChange}
                autoComplete="off"
              />
              <div className="actions">
                <button type="submit" className='create'>
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className="cancel"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setForm({ name: '', description: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface SortableSagaCardProps {
  saga: SagaType;
  index: number;
  nameCounts: Record<string, number>;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableSagaCard({ saga, index, nameCounts, onEdit, onDelete }: SortableSagaCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: saga.id.toString() });

  const key = (saga.name || '').trim().toLowerCase();
  const isDuplicate = key && (nameCounts[key] || 0) > 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    boxShadow: isDragging ? '0 0 10px #ff0000' : undefined,
    background: isDragging ? '#ffcccc' : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`saga-card ${isDuplicate ? 'saga-duplicate' : ''} ${isDragging ? 'dragging' : ''}`}
      data-id={saga.id}
      style={style}
    >
      <div className="saga-card-header">
        <h3 className="saga-name">{saga.name}</h3>
        <div className="saga-actions-top">
          <button className="icon option" title="Editar" onClick={onEdit}>
            <FaEdit size={18} />
          </button>
          <button className="icon option" title="Eliminar" onClick={onDelete}>
            <FaTrash size={18} />
          </button>
        </div>
      </div>
      <div className="saga-card-body">
        <p className="saga-desc">{saga.description}</p>
      </div>
    </div>
  );
}

export default SagaPanel;
