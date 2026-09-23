'use client';

import { use, useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { trpc } from '@/utils/trpc';

export default function ReadMessagePage({
  params,
}: {
  params: Promise<{ id: string; key: string }>;
}) {
  const { id, key } = use(params);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = trpc.message.getAndBurn.useQuery(
    { id, key },
    {
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  const handleCopy = () => {
    if (!data?.message) return;
    navigator.clipboard.writeText(data.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-gray-500 text-sm">Loading message…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            Message not available
          </h1>
          <p className="text-sm text-gray-500">
            It may have expired or already been viewed.
          </p>
        </div>
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
            {data?.message}
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
      </div>
    </main>
  );
}
