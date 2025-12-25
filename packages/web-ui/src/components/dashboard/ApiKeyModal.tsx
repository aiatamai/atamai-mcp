'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { useApiKeys } from '@/hooks/useApiKeys';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyGenerated: () => void;
  isLoading: boolean;
}

export function ApiKeyModal({
  isOpen,
  onClose,
  onKeyGenerated,
  isLoading,
}: ApiKeyModalProps) {
  const { generateKey } = useApiKeys();
  const [step, setStep] = useState<'input' | 'display'>('input');
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!keyName.trim()) {
      setError('Please enter a name for the API key');
      return;
    }

    const result = await generateKey(keyName);
    if (result) {
      setGeneratedKey(typeof result === 'string' ? result : (result as any)?.key || result);
      setStep('display');
      onKeyGenerated();
    } else {
      setError('Failed to generate API key');
    }
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    if (step === 'display') {
      // Reset modal when closing after successful generation
      setStep('input');
      setKeyName('');
      setGeneratedKey(null);
      setCopied(false);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="card max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'input' ? (
          <>
            {/* Input Step */}
            <h2 className="text-2xl font-bold text-white mb-2">Create API Key</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter a name to identify this API key
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => {
                    setKeyName(e.target.value);
                    setError(null);
                  }}
                  placeholder="e.g., Development, Production"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/50">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate Key'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 rounded-lg border border-gray-800 text-gray-300 hover:border-gray-700 transition-colors"
              >
                Cancel
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Display Step */}
            <h2 className="text-2xl font-bold text-white mb-2">API Key Created</h2>
            <p className="text-gray-400 text-sm mb-6">
              Copy your key below. You won't be able to see it again!
            </p>

            <div>
              <p className="text-xs text-gray-400 mb-2">Your API Key</p>
              <div className="bg-black/50 border border-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <code className="text-green-400 text-sm break-all">{generatedKey}</code>
                  <button
                    onClick={copyKey}
                    className="text-gray-500 hover:text-gray-300 ml-2 flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300">
                  Store this key securely. It will be used to authenticate API requests.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
