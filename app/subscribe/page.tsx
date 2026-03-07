export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-warm-900">Subscribe</h1>
      <p className="mt-4 text-warm-600">
        Stay updated — join our newsletter
      </p>
      <form className="mt-6 flex flex-col gap-4">
        <input
          type="email"
          placeholder="your@email.com"
          className="rounded-lg border border-warm-300 bg-white px-4 py-3 text-warm-900 placeholder:text-warm-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
