import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const text = z.string().trim().min(1);
const cases = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cases' }),
  schema: z.object({
    num: text, title: text, summary: text, stack: z.array(text).min(1),
    year: text, role: text, company: text, status: text, published: z.boolean(),
    description: z.string(), diagram: z.array(text).length(3).optional(),
    sections: z.array(z.object({ heading: text, body: text })),
    images: z.array(z.object({
      src: text, alt: text, caption: text, width: z.number().int().positive(), height: z.number().int().positive(),
    })).default([]),
    links: z.array(z.object({ label: text, url: z.string().url() })),
  }).superRefine((entry, ctx) => {
    if (entry.published && (!entry.description.trim() || entry.sections.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Published cases need a description and sections.' });
    }
  }),
});
const jobs = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/jobs' }),
  schema: z.object({ order: text, period: text, title: text, company: text, location: text, bullets: z.array(text).min(1) }),
});
const articles = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/articles' }),
  schema: z.object({
    title: text, description: text, publishedAt: z.coerce.date(),
    readingTime: z.number().int().nonnegative(), tags: z.array(z.string()),
    sourceUrl: z.string().url(),
  }),
});
const ryabJournal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/ryab-journal' }),
  schema: z.object({ title: text, description: text, publishedAt: z.coerce.date(), telegramUrl: z.string().url().optional() }),
});
export const collections = { cases, jobs, articles, ryabJournal };
