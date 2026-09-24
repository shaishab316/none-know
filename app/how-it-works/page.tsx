'use client';

import Link from 'next/link';
import {
  FiShield,
  FiLock,
  FiEyeOff,
  FiKey,
  FiShare2,
  FiCheckCircle,
} from 'react-icons/fi';
import { TbFlameFilled } from 'react-icons/tb';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* How It Works (Step-by-step) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            How It Works
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FiKey className="w-4 h-4 text-blue-600" />
                  Local Encryption in Your Browser
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When you write a message, your browser generates a secret
                  decryption key. Your message is encrypted right inside your
                  browser <strong>before</strong> anything is sent over the
                  internet.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FiShare2 className="w-4 h-4 text-blue-600" />
                  Key Lives Only in the Link Hash (`#`)
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  The link you receive contains the decryption key after the `#`
                  symbol (e.g.{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-mono">
                    /read/123#key
                  </code>
                  ). Web browsers{' '}
                  <strong>never send the hash fragment to servers</strong>, so
                  our server stores only unreadable ciphertext.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TbFlameFilled className="w-4 h-4 text-blue-600" />
                  Self-Destructs Upon Reading
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When the recipient opens the link, their browser fetches the
                  encrypted payload and decrypts it locally. Once the view limit
                  or expiration time is reached, the encrypted message is
                  deleted forever.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Should You Use It? (Human Benefits) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Why Use It?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Benefit 1 */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <FiLock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900">
                Zero-Knowledge Privacy
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Even if our database were leaked, no one could read your
                messages because we don&apos;t hold the decryption keys.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FiEyeOff className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900">
                No Chat Logs or Backups
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Sending sensitive information via Slack, Email, or WhatsApp
                leaves it stored indefinitely in message backups.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <TbFlameFilled className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900">
                Total Control & Burn Limits
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Set exact constraints: burn after 1 view, set a timer (e.g. 1
                hour), or auto-expire without worries.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                <FiCheckCircle className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900">
                No Account Required
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No signups, no email tracking, no personal information needed.
                Completely anonymous by design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
