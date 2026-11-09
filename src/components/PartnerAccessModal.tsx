import React, { useState } from 'react';
import {
  X,
  Rocket,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Waves,
} from 'lucide-react';

interface PartnerAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  databaseConnected?: boolean;
}

export const PartnerAccessModal: React.FC<PartnerAccessModalProps> = ({ isOpen, onClose, databaseConnected = false }) => {
  const [copiedType, setCopiedType] = useState<'password' | 'invite' | 'url' | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isInternalPreview =
    currentHost.includes('ais-dev-') ||
    currentHost.includes('ais-pre-') ||
    currentHost === 'localhost';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyText = (text: string, type: 'password' | 'invite' | 'url') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  if (databaseConnected) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><section role="dialog" aria-modal="true" aria-label="Workspace access" className="w-full max-w-md space-y-4 rounded-xl bg-white p-6"><h2 className="text-lg font-semibold">Workspace access</h2><p className="text-sm text-slate-600">Each person signs in with their own account. An administrator must grant workspace membership before they can see company records. Sharing the portal link does not grant access.</p><div className="flex gap-3"><button type="button" onClick={() => copyText(currentUrl,'url')} className="rounded-lg bg-[#194b91] px-4 py-2 text-sm text-white">{copiedType === 'url' ? 'Copied' : 'Copy portal link'}</button><button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">Close</button></div></section></div>;

  const inviteTemplate = `Digital Nomad — Pacific Operations & Financial Portal
Partner Password: DigitalNomad26
${!isInternalPreview ? `Live Portal URL: ${currentUrl}` : '(Insert your published Cloud Run or AI Studio Share link here)'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24344D]/50 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-[#D9F1EC] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-5 relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EAF4F8] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF4F8] text-[#164B91] border border-[#164B91]/15">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#24344D] font-heading flex items-center gap-1.5">
                <span>Make Live & Share with Partner</span>
                <Waves className="w-4 h-4 text-[#19A7A0]" />
              </h3>
              <p className="text-xs text-[#24344D]/70">
                Partner Password: <span className="font-mono font-bold text-[#164B91]">DigitalNomad26</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#24344D]/50 hover:text-[#24344D] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if inside AI Studio internal preview */}
        {isInternalPreview ? (
          <div className="p-4 rounded-xl bg-[#EAF4F8] border border-[#164B91]/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#164B91] font-heading">
              <AlertTriangle className="w-4 h-4 text-[#F28C28] shrink-0" />
              <span>How Cloud Run Live Deployment Operates</span>
            </div>
            <p className="text-xs text-[#24344D]/80 leading-relaxed">
              The <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D9F1EC] text-[#164B91]">ais-dev</code> and{' '}
              <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D9F1EC] text-[#164B91]">ais-pre</code> URLs are internal Google AI Studio proxies. To activate the public URL for your partner, click <strong>Deploy</strong> or <strong>Share</strong> in the top AI Studio toolbar.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#D9F1EC]/40 border border-[#19A7A0]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#164B91] flex items-center gap-1.5 font-heading">
                <ShieldCheck className="w-4 h-4 text-[#19A7A0]" />
                Live Public URL Active
              </span>
              <button
                type="button"
                onClick={() => copyText(currentUrl, 'url')}
                className="text-xs font-semibold text-[#164B91] hover:text-[#123e78] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#D9F1EC] cursor-pointer"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'url' ? 'Copied URL' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="text-xs font-mono text-[#24344D] truncate bg-white p-2 rounded-lg border border-[#D9F1EC]">
              {currentUrl}
            </div>
          </div>
        )}

        {/* Step-by-step instructions to publish */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#24344D] font-heading">
            How to Deploy Standalone Public Link:
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#164B91] font-heading">
              <Rocket className="w-4 h-4 text-[#164B91] shrink-0" />
              <span>Deploy to Google Cloud Run (Recommended)</span>
            </div>
            <ol className="text-xs text-[#24344D]/75 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                In the <strong>top-right bar of Google AI Studio</strong>, click <strong>Deploy to Cloud Run</strong> (Rocket icon).
              </li>
              <li>
                Click <strong>Deploy</strong>. Cloud Run launches <code className="font-mono text-[#164B91]">https://...run.app</code> which opens on any device.
              </li>
            </ol>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F5F7FA] border border-[#D9F1EC] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#6941A5] font-heading">
              <Share2 className="w-4 h-4 text-[#6941A5] shrink-0" />
              <span>Share via AI Studio Link or GitHub</span>
            </div>
            <ul className="text-xs text-[#24344D]/75 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                Click the <strong>Share</strong> button in the top toolbar to publish the applet.
              </li>
              <li>
                Or push to GitHub and host on Vercel/Netlify for custom domain linking.
              </li>
            </ul>
          </div>
        </div>

        {/* Credentials Box */}
        <div className="p-3.5 rounded-xl bg-[#EAF4F8] border border-[#164B91]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-[11px] font-semibold text-[#164B91] flex items-center gap-1.5 font-heading">
              <ShieldCheck className="w-3.5 h-3.5 text-[#19A7A0]" />
              Partner Access Credentials
            </div>
            <div className="text-sm font-mono font-bold text-[#24344D]">
              Password: <span className="text-[#164B91]">DigitalNomad26</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyText('DigitalNomad26', 'password')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#164B91] border border-[#D9F1EC] hover:bg-[#F5F7FA] transition-colors flex items-center gap-1.5 cursor-pointer font-heading"
            >
              {copiedType === 'password' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'password' ? 'Copied!' : 'Copy Password'}</span>
            </button>
            <button
              type="button"
              onClick={() => copyText(inviteTemplate, 'invite')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#164B91] text-white hover:bg-[#123e78] transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer font-heading"
            >
              {copiedType === 'invite' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedType === 'invite' ? 'Invite Copied!' : 'Copy Invite'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
