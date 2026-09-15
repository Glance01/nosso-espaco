import React from 'react';
import { Certification } from '../../types';
import { Plus, Trash2, Award } from 'lucide-react';

interface CertificationsFormProps {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}

export const CertificationsForm: React.FC<CertificationsFormProps> = ({ certifications, onChange }) => {
  const addCert = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
    };
    onChange([...certifications, newCert]);
  };

  const updateCert = (id: string, field: keyof Certification, value: string) => {
    onChange(
      certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCert = (id: string) => {
    onChange(certifications.filter((c) => c.id !== id));
  };

  return (
    <div id="certifications-form-section" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[#0F172A]">Certificações & Licenças</h4>
          <p className="text-xs text-[#64748B]">Adicione certificados técnicos, cursos profissionais ou prémios.</p>
        </div>
        <button
          type="button"
          id="btn-add-cert"
          onClick={addCert}
          className="btn-apple-warm inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-white rounded-2xl text-xs font-bold active:scale-[0.98] self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Certificado
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-8 px-4 border border-[#CBD5E1] rounded-3xl bg-[#F8FAFC]">
          <Award className="w-8 h-8 text-[#2563EB] mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-[#0F172A]">Nenhum certificado registado</p>
          <button
            type="button"
            onClick={addCert}
            className="mt-2 text-xs text-[#2563EB] font-bold hover:underline"
          >
            + Adicionar certificado profissional
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-4 bg-gradient-to-b from-white to-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3 shadow-xs hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0F172A] truncate">
                  {cert.name || 'Nova Certificação'}
                </span>
                <button
                  type="button"
                  onClick={() => removeCert(cert.id)}
                  className="text-[#94A3B8] hover:text-rose-600 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => updateCert(cert.id, 'name', e.target.value)}
                    placeholder="Nome do Certificado (Ex: PMP, AWS Certified)"
                    className="apple-input w-full px-3 py-2 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => updateCert(cert.id, 'issuer', e.target.value)}
                    placeholder="Emissor (Ex: PMI, Google)"
                    className="apple-input w-full px-3 py-2 text-xs font-medium text-[#0F172A] placeholder:text-[#94A3B8]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
