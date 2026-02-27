import { defineField, defineType } from 'sanity';

export const spotlightPerson = defineType({
  name: 'spotlightPerson',
  title: 'Spotlight Person',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'profession',
      title: 'Profession',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'syndromeType',
      title: 'Duane Syndrome Type',
      type: 'string',
      options: {
        list: [
          { title: 'Type 1', value: 'type1' },
          { title: 'Type 2', value: 'type2' },
          { title: 'Type 3', value: 'type3' },
          { title: 'Unknown', value: 'unknown' },
        ],
      },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'platform', title: 'Platform', type: 'string' },
            { name: 'url', title: 'URL', type: 'url' },
          ],
        },
      ],
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
