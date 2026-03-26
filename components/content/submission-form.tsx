'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

const submissionTypes = [
  { value: 'specialist', label: 'Suggest a Specialist' },
  { value: 'blog', label: 'Submit a Blog Post' },
  { value: 'spotlight', label: 'Suggest a Spotlight Person' },
  { value: 'resource', label: 'Suggest a Resource' },
];

export function SubmissionForm() {
  const [type, setType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-lg font-medium text-green-800">
          Thank you for your submission!
        </p>
        <p className="mt-2 text-green-600">
          Our team will review it and get back to you if needed.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => { setSubmitted(false); setType(''); }}
        >
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {/* Honeypot field for spam prevention */}
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <Select
        id="type"
        label="What would you like to submit?"
        options={submissionTypes}
        placeholder="Select a type..."
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
      />

      {type === 'specialist' && (
        <>
          <Input id="name" name="name" label="Specialist Name" required />
          <Input id="country" name="country" label="Country" required />
          <Input id="city" name="city" label="City" />
          <Select
            id="patient-type"
            name="patientType"
            label="Treats"
            options={[
              { value: 'child', label: 'Children' },
              { value: 'adult', label: 'Adults' },
              { value: 'both', label: 'Both' },
            ]}
          />
          <Input id="specialty" name="specialty" label="Specialty" placeholder="e.g., Strabismus Surgery" />
          <Input id="website" name="specialistWebsite" label="Website" type="url" />
          <Textarea id="notes" name="notes" label="Additional Notes" />
        </>
      )}

      {type === 'blog' && (
        <>
          <Input id="title" name="title" label="Blog Post Title" required />
          <Textarea id="content" name="content" label="Content" required rows={10} />
          <Input id="authorName" name="authorName" label="Your Name" />
        </>
      )}

      {type === 'spotlight' && (
        <>
          <Input id="name" name="name" label="Person's Name" required />
          <Input id="profession" name="profession" label="Profession" />
          <Textarea id="bio" name="bio" label="Brief Bio" />
          <Input id="link" name="link" label="Link to interview/article (optional)" type="url" />
        </>
      )}

      {type === 'resource' && (
        <>
          <Input id="name" name="name" label="Resource Name" required />
          <Input id="url" name="url" label="URL" type="url" required />
          <Select
            id="resourceType"
            name="resourceType"
            label="Type"
            options={[
              { value: 'youtube', label: 'YouTube' },
              { value: 'blog', label: 'Blog' },
              { value: 'podcast', label: 'Podcast' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Textarea id="description" name="description" label="Description" />
        </>
      )}

      {type && (
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      )}
    </form>
  );
}
