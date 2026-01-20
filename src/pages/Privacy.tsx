import { useSEO } from '../hooks/useSEO'

export function Privacy() {
  useSEO({
    title: 'Privacy Policy - JSON Tools',
    description: 'Privacy policy for JSON Tools. All processing happens locally in your browser. No data is collected or transmitted.',
    canonical: '/privacy',
  })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6 text-muted-foreground">
        <p className="text-lg">
          <strong className="text-foreground">Last updated:</strong> January 2026
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Our Commitment to Privacy</h2>
          <p>
            JSON Tools is designed with privacy as a core principle. We believe your data belongs to you, 
            and we&apos;ve built our tools to ensure it stays that way.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Data Collection</h2>
          <p>
            <strong className="text-foreground">We do not collect, store, or transmit any of your JSON data.</strong>
          </p>
          <p>
            All JSON processing happens entirely within your browser. Your data never leaves your device. 
            There are no servers that receive, process, or store your JSON content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Local Storage</h2>
          <p>
            We use browser local storage only for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Remembering your preferences (e.g., indentation settings)</li>
            <li>Storing your OpenAI API key if you choose to use the AI Assistant feature (encrypted locally)</li>
            <li>Tracking recently used tools for quick access</li>
          </ul>
          <p>
            This data remains on your device and is never transmitted to any server.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p>
            We use Google Analytics to understand how our tools are used. This helps us improve the product. 
            Google Analytics collects:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Page views and navigation patterns</li>
            <li>Device type and browser information</li>
            <li>General geographic location (country/city level)</li>
          </ul>
          <p>
            <strong className="text-foreground">Google Analytics never has access to your JSON data.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Chrome Extension</h2>
          <p>
            The JSON Tools Chrome Extension operates under the same privacy principles:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All processing happens locally in your browser</li>
            <li>No data is sent to external servers</li>
            <li>Preferences are stored locally using Chrome&apos;s storage API</li>
            <li>The extension requires minimal permissions necessary for functionality</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">AI Assistant Feature</h2>
          <p>
            If you use the AI Assistant feature:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>You provide your own OpenAI API key</li>
            <li>Your API key is stored locally in your browser (not on our servers)</li>
            <li>When using this feature, your prompts are sent directly to OpenAI&apos;s servers</li>
            <li>Please review OpenAI&apos;s privacy policy for how they handle your data</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
          <p>
            The only third-party service we use is Google Analytics for usage statistics. 
            No other third-party services have access to any user data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            If you have any questions about this privacy policy, please open an issue on our 
            GitHub repository: <a href="https://github.com/Root-kjh/json-tools" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://github.com/Root-kjh/json-tools</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page 
            with an updated revision date.
          </p>
        </section>
      </div>
    </div>
  )
}
