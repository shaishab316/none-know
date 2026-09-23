'use client';

import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { trpc } from '@/utils/trpc';

export default function CreateMessagePage() {
  const [messageText, setMessageText] = useState('');
  const [maxView, setMaxView] = useState(1);
  const [expireValue, setExpireValue] = useState(1);
  const [expireUnit, setExpireUnit] = useState<'minutes' | 'hours' | 'days'>(
    'hours',
  );
  const [copied, setCopied] = useState(false);

  const createMutation = trpc.message.create.useMutation();

  const getExpireMinutes = () => {
    if (expireUnit === 'minutes') return expireValue;
    if (expireUnit === 'hours') return expireValue * 60;
    return expireValue * 60 * 24;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const ttlDate = new Date(
      Date.now() + getExpireMinutes() * 60 * 1000,
    ).toISOString();

    await createMutation.mutateAsync({
      message: messageText.trim(),
      maxView: Number(maxView),
      ttl: ttlDate,
    });
  };

  const generatedLink = createMutation.data
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/read/${createMutation.data._id}/${createMutation.data.key}`
    : '';

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setMessageText('');
    setMaxView(1);
    setExpireValue(1);
    setExpireUnit('hours');
    createMutation.reset();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-lg font-semibold text-gray-900">
            Create secure message
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Link will self-destruct after viewing or when time expires
          </p>
        </div>

        <div className="p-6">
          {!createMutation.data ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write your secret message here..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  required
                />
              </div>

              {/* Max Views */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Maximum views
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxView}
                  onChange={(e) => setMaxView(Number(e.target.value))}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Message will be deleted after this many views
                </p>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expires after
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={expireValue}
                    onChange={(e) => setExpireValue(Number(e.target.value))}
                    className="w-24 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={expireUnit}
                    onChange={(e) =>
                      setExpireUnit(
                        e.target.value as 'minutes' | 'hours' | 'days',
                      )
                    }
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createMutation.isPending || !messageText.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
              >
                {createMutation.isPending ? 'Creating...' : 'Generate link'}
              </button>
            </form>
          ) : (
            /* Success */
            <div className="space-y-5">
              <div className="text-center py-2">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 mb-3">
                  <FiCheck className="w-5 h-5" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">
                  Link ready
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Share this link. It will disappear after the limit is reached.
                </p>
              </div>

              {/* Link + Copy Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Secure link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="flex-1 min-w-0 px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-gray-50 text-gray-700 font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="p-2.5 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                    title={copied ? 'Copied!' : 'Copy link'}
                  >
                    {copied ? (
                      <FiCheck className="w-5 h-5 text-green-600" />
                    ) : (
                      <FiCopy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-md px-4 py-3 text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Max views</span>
                  <span className="font-medium text-gray-900">
                    {createMutation.data.maxView}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expires at</span>
                  <span className="font-medium text-gray-900">
                    {new Date(createMutation.data.ttl).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
              >
                Create another message
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
