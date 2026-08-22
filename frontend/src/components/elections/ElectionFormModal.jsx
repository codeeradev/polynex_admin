import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const EMPTY_FORM = { name: '', startDate: '', endDate: '', regionScope: '' };

/**
 * Create-election dialog. Region scope is entered as a comma-separated
 * list and split before submit — a single text input, kept simple
 * until there's a real region picker/taxonomy to back a multi-select.
 */
export default function ElectionFormModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setError('');
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date cannot be before the start date.');
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({
      name: form.name.trim(),
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      regionScope: form.regionScope
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean),
    });
    setSubmitting(false);

    if (result?.success) {
      handleClose();
    } else if (result?.message) {
      setError(result.message);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Create election">
      <form onSubmit={handleSubmit}>
        <FormField
          id="election-name"
          label="Name"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="e.g. 2026 General Election"
          required
        />
        <div className="ui-form-row">
          <FormField
            id="election-start"
            label="Start date"
            type="date"
            value={form.startDate}
            onChange={handleChange('startDate')}
          />
          <FormField
            id="election-end"
            label="End date"
            type="date"
            value={form.endDate}
            onChange={handleChange('endDate')}
          />
        </div>
        <FormField
          id="election-region"
          label="Region scope"
          value={form.regionScope}
          onChange={handleChange('regionScope')}
          placeholder="Comma-separated, e.g. North, East, Central"
        />

        {error && <p className="ui-form-error">{error}</p>}

        <div className="ui-form-actions">
          <Button variant="text" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create election
          </Button>
        </div>
      </form>
    </Modal>
  );
}
