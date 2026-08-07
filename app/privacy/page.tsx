export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: 6 August 2026</p>

      <section className="space-y-6">
        <p>
          Plano ("we", "us", "our") provides a social media
          scheduling and management tool. This policy explains what
          information we collect, how we use it, and the choices you have.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">1. Information We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account information:</strong> email address, name, and profile picture, provided when you sign up or sign in with Google.</li>
          <li><strong>Connected social account data:</strong> when you connect a social media account (Facebook, Instagram, LinkedIn, TikTok, and others as supported), we receive and store an access token that lets us publish content on your behalf, along with the connected account's public name and identifier.</li>
          <li><strong>Content you create:</strong> post captions, scheduling information, and media (images/video) you upload to be published.</li>
          <li><strong>Usage data:</strong> basic technical information such as browser type and access times, for security and reliability purposes.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white pt-4">2. How We Use Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To publish or schedule content to the social media accounts you explicitly connect and authorize.</li>
          <li>To operate, maintain, and improve the Plano service.</li>
          <li>To generate AI-assisted captions and content suggestions using Google's Gemini API, based on inputs you provide.</li>
          <li>To communicate with you about your account or service changes.</li>
        </ul>

        <h2 className="text-xl font-semibold text-white pt-4">3. How We Store and Protect Data</h2>
        <p>
          Access tokens for connected social accounts are encrypted at rest.
          Data is stored using Supabase (PostgreSQL) with row-level security
          restricting access to your own workspace's data. We do not
          sell your personal information.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">4. Third-Party Services</h2>
        <p>
          We integrate with third-party platforms you choose to connect
          (e.g. Meta/Facebook/Instagram, LinkedIn, TikTok) solely to publish
          content on your behalf, per each platform's own terms and
          privacy policy. We also use Google's Gemini API for AI content
          generation. We do not share your data with these providers beyond
          what is necessary to provide the requested functionality.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">5. Data Deletion</h2>
        <p>
          You can disconnect any connected social account at any time from
          the Channels page, which revokes and deletes the stored access
          token. To request deletion of your full account and all
          associated data, contact us at news@elabram.com. We will process
          deletion requests within 30 days.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">6. Your Rights</h2>
        <p>
          You may access, correct, or request deletion of your personal
          data at any time. Contact us at news@elabram.com for any privacy
          request.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">7. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. Material changes
          will be communicated via email or in-app notice.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">8. Contact</h2>
        <p>
          Questions about this policy: news@elabram.com
        </p>
      </section>
    </div>
  );
}