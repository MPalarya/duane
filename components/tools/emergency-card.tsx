'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function EmergencyCard() {
  const [name, setName] = useState('');
  const [duaneType, setDuaneType] = useState('1');
  const [affectedEye, setAffectedEye] = useState('left');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [showCard, setShowCard] = useState(false);

  function handlePrint() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  return (
    <div>
      {!showCard && (
        <div className="space-y-4 rounded-xl border border-warm-200 bg-card p-6">
          <Input
            id="ec-name"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            id="ec-type"
            label="Duane Syndrome Type"
            value={duaneType}
            onChange={(e) => setDuaneType(e.target.value)}
            options={[
              { value: '1', label: 'Type 1' },
              { value: '2', label: 'Type 2' },
              { value: '3', label: 'Type 3' },
            ]}
          />
          <Select
            id="ec-eye"
            label="Affected Eye"
            value={affectedEye}
            onChange={(e) => setAffectedEye(e.target.value)}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'both', label: 'Both' },
            ]}
          />
          <Input
            id="ec-doctor"
            label="Ophthalmologist Name (optional)"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
          <Input
            id="ec-phone"
            label="Ophthalmologist Phone (optional)"
            value={doctorPhone}
            onChange={(e) => setDoctorPhone(e.target.value)}
          />
          <Button onClick={() => setShowCard(true)} size="lg">
            Generate Card
          </Button>
        </div>
      )}

      {showCard && (
        <div>
          <div className="mb-4 flex gap-3 print:hidden">
            <Button onClick={handlePrint}>Print / Save as PDF</Button>
            <Button variant="outline" onClick={() => setShowCard(false)}>Edit</Button>
          </div>

          {/* Card — designed for wallet size when printed */}
          <div className="mx-auto max-w-sm">
            {/* Front of card */}
            <div className="rounded-xl border-2 border-coral-300 bg-white p-5">
              <div className="flex items-center justify-between border-b border-coral-200 pb-2">
                <div>
                  <h2 className="text-lg font-bold text-coral-500">MEDICAL ALERT</h2>
                  <p className="text-xs text-warm-500">Duane Retraction Syndrome</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-100 text-xl">
                  👁
                </div>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <div>
                  <span className="font-semibold text-warm-800">Name:</span>{' '}
                  <span className="text-warm-700">{name || '_______________'}</span>
                </div>
                <div>
                  <span className="font-semibold text-warm-800">Diagnosis:</span>{' '}
                  <span className="text-warm-700">Duane Syndrome Type {duaneType}</span>
                </div>
                <div>
                  <span className="font-semibold text-warm-800">Affected:</span>{' '}
                  <span className="text-warm-700">{affectedEye === 'both' ? 'Both eyes' : `${affectedEye.charAt(0).toUpperCase() + affectedEye.slice(1)} eye`}</span>
                </div>
                <div>
                  <span className="font-semibold text-warm-800">ICD-10:</span>{' '}
                  <span className="text-warm-700">H50.81</span>
                </div>
              </div>

              <div className="mt-3 rounded bg-coral-50 p-2 text-xs text-coral-500">
                <strong>NOTE TO ER STAFF:</strong> This patient has a congenital eye movement
                disorder. The abnormal eye alignment/movement is their <strong>baseline</strong>,
                NOT a sign of acute neurological pathology. Do not order emergent neuroimaging
                for the eye findings alone.
              </div>

              {(doctorName || doctorPhone) && (
                <div className="mt-3 text-xs text-warm-500">
                  <strong>Ophthalmologist:</strong>{' '}
                  {doctorName}{doctorPhone && ` — ${doctorPhone}`}
                </div>
              )}

              <div className="mt-3 border-t border-warm-100 pt-2 text-center text-xs text-warm-400">
                OMIM #126800 | duane-syndrome.com
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-warm-400 print:hidden">
            Tip: Print this, cut to wallet size, and keep it in your wallet or phone case.
          </p>
        </div>
      )}
    </div>
  );
}
