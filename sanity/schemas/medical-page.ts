import { defineField, defineType } from 'sanity';

export const medicalPage = defineType({
  name: 'medicalPage',
  title: 'Medical Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', title: 'Alt Text', type: 'string' },
            { name: 'caption', title: 'Caption', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Source Title', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
            { name: 'organization', title: 'Organization', type: 'string' },
          ],
        },
      ],
    }),
    defineField({
      name: 'lastReviewedDate',
      title: 'Last Reviewed Date',
      type: 'date',
    }),
    defineField({
      name: 'schemaType',
      title: 'Schema.org Type',
      type: 'string',
      options: {
        list: [
          { title: 'MedicalCondition', value: 'MedicalCondition' },
          { title: 'MedicalWebPage', value: 'MedicalWebPage' },
        ],
      },
    }),
    defineField({
      name: 'locale',
      title: 'Language',
      type: 'string',
      options: {
        list: [
          { title: 'English', value: 'en' },
          { title: 'Hebrew', value: 'he' },
        ],
      },
      initialValue: 'en',
    }),
  ],
});
