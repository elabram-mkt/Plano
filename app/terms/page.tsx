export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: 6 August 2026</p>

      <section className="space-y-6">
        <p>
          These Terms of Service ("Terms") govern your use of Plano
          (the "Service"), operated by PT. Elabram Systems. By creating
          an account or using the Service, you agree to these Terms.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">1. The Service</h2>
        <p>
          Plano lets you create, schedule, and publish content to
          third-party social media platforms you connect to your account,
          and provides AI-assisted content generation tools.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">2. Accounts</h2>
        <p>
          You must provide accurate information when creating an account
          and are responsible for maintaining the security of your
          credentials and any activity under your account. You must be at
          least 18 years old, or the age of majority in your jurisdiction,
          to use the Service.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">3. Connected Social Accounts</h2>
        <p>
          When you connect a third-party social media account (Facebook,
          Instagram, LinkedIn, TikTok, or others as supported), you
          authorize Plano to publish content to that account on your
          behalf, per your instructions. You are solely responsible for
          the content you choose to publish and for complying with each
          connected platform's own terms of service. You may disconnect
          any account at any time.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">4. Your Content</h2>
        <p>
          You retain ownership of the content (captions, images, video)
          you create and upload through the Service. You grant Plano a
          limited license to store, process, and transmit that content
          solely as necessary to provide the Service, including
          publishing it to platforms you've connected and authorized.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">5. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Publish content that is illegal, infringing, or violates any connected platform's policies</li>
          <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service</li>
          <li>Use the Service to send spam or engage in platform manipulation</li>
        </ul>

        <h2 className="text-xl font-semibold text-white pt-4">6. AI-Generated Content</h2>
        <p>
          Content generated using the Service's AI features is provided
          as a starting point or suggestion. You are responsible for
          reviewing and editing AI-generated content before publishing it.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">7. Service Availability</h2>
        <p>
          The Service is provided "as is." We do not guarantee
          uninterrupted availability, and scheduled posts may occasionally
          fail to publish due to third-party platform issues outside our
          control. We are not liable for content that fails to publish or
          publishes incorrectly due to third-party platform changes,
          outages, or policy enforcement.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">8. Termination</h2>
        <p>
          You may stop using the Service and delete your account at any
          time. We may suspend or terminate accounts that violate these
          Terms.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, PT. Elabram Systems
          shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of the Service.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">10. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of
          the Service after changes constitutes acceptance of the revised
          Terms.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the Republic of
          Indonesia, without regard to conflict of law principles.
        </p>

        <h2 className="text-xl font-semibold text-white pt-4">12. Contact</h2>
        <p>Questions about these Terms: news@elabram.com</p>
      </section>
    </div>
  );
}