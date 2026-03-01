import { defineField, defineType } from 'sanity';

export const featuredAdvocate = defineType({
  name: 'featuredAdvocate',
  title: 'Featured Advocate',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Role tags like Musician, Model, Doctor',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video Embed URL',
      description:
        'TikTok embed: https://www.tiktok.com/embed/v2/VIDEO_ID — Instagram reel embed: https://www.instagram.com/reel/CODE/embed/',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'TikTok', value: 'tiktok' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Twitter/X', value: 'twitter' },
                  { title: 'Other', value: 'other' },
                ],
              },
            },
            { name: 'url', title: 'URL', type: 'url' },
            {
              name: 'followers',
              title: 'Followers',
              description: 'Formatted follower count, e.g. "155K" or "2.2M"',
              type: 'string',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      description: 'Lower numbers appear first',
      type: 'number',
      initialValue: 0,
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
  preview: {
    select: {
      title: 'name',
      subtitle: 'tags',
    },
  },
});
