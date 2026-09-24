'use client';

import { use, useEffect, useState, useSyncExternalStore } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { trpc } from '@/utils/trpc';
import { decryptFromSharing } from '@/lib/crypto-client';

// The key is read from the hash fragment, which browsers never send to the
// server — so the server cannot decrypt the cipher text it stores.
function subscribeToHash(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getHashKey(): string {
  return window.location.hash.replace(/^#/, '');
}

function getServerHashKey(): null {
  return null;
}

export default function ReadMessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const key = useSyncExternalStore(
    subscribeToHash,
    getHashKey,
    getServerHashKey,
  );

  const [message, setMessage] = useState<string | null>(null);
  const [decryptFailed, setDecryptFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = trpc.message.getAndBurn.useQuery(
    { id },
    {
      enabled: Boolean(key),
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  // Decrypt locally once the cipher text arrives.
  useEffect(() => {
    if (!data || !key) return;

    let cancelled = false;

    decryptFromSharing(data.cipher, key)
      .then((text) => {
        if (!cancelled) setMessage(text);
      })
      .catch(() => {
        if (!cancelled) setDecryptFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [data, key]);

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (key === null || (Boolean(key) && isLoading)) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Loading message…</p>
      </main>
    );
  }

  if (!key) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Could not decrypt message
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            The link is missing its decryption key.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            Create a secret message
          </Link>
        </div>
      </main>
    );
  }

  if (decryptFailed || error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            {decryptFailed
              ? 'Could not decrypt message'
              : 'Message not available'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {decryptFailed
              ? 'The decryption key in this link is invalid.'
              : 'It may have expired or already been viewed.'}
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
          >
            Create a secret message
          </Link>
        </div>
      </main>
    );
  }

  if (!message) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Decrypting…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-base font-semibold text-gray-900">
            Secret Message
          </h1>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? (
              <FiCheck className="w-5 h-5 text-green-600" />
            ) : (
              <FiCopy className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Message */}
        <div className="px-6 py-6">
          <div className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message}
          </div>
        </div>

        {/* Info */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600 flex justify-between">
          <span>
            Views left:{' '}
            <strong className="text-gray-900">
              {data?.viewsRemaining === null
                ? 'Unlimited'
                : data?.viewsRemaining}
            </strong>
          </span>
          <span>
            Expires:{' '}
            <strong className="text-gray-900">
              {data?.ttl
                ? new Date(data.ttl).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Never'}
            </strong>
          </span>
        </div>

        {/* Simple Motivation Banner */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Need to reply or send a private note?
          </p>
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors whitespace-nowrap"
          >
            Create message
          </Link>
        </div>
      </div>
    </main>
  );
}