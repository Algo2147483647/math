import { AI_PROVIDER_PRESETS } from "../../ai/providerPresets";
import type { AiProvider } from "../../ai/types";

export default function ProviderIcon({ provider }: { provider: AiProvider }) {
  const preset = AI_PROVIDER_PRESETS[provider];
  return (
    <span className={`provider-icon provider-icon-${provider}`} aria-hidden="true">
      <img src={preset.logoSrc} alt="" className="provider-icon-img" />
    </span>
  );
}
