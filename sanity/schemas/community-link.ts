import { defineField, defineType } from 'sanity';

export const communityLink = defineType({
  name: 'communityLink',
  title: 'Community Link',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'Facebook', value: 'facebook' },
          { title: 'Reddit', value: 'reddit' },
          { title: 'Discord', value: 'discord' },
          { title: 'Forum', value: 'forum' },
          { title: 'Organization', value: 'organization' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'Preview Image',
      type: 'image',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Preview Title',
      type: 'string',
    }),
    defineField({
      name: 'memberCount',
      title: 'Member Count',
      type: 'number',
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
