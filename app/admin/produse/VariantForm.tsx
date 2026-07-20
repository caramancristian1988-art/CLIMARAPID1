"use client";

import { useActionState } from "react";
import { AdminInput } from "../components/AdminField";
import SpecificationsEditor from "../components/SpecificationsEditor";
import type { VariantFormState } from "@/lib/adminProductVariantActions";

interface VariantDefaults {
  id?: string;
  label?: string;
  btu?: number | null;
  surface?: number | null;
  price?: number;
  oldPrice?: number | null;
  badge?: string | null;
  order?: number;
  availability?: string;
  isDefault?: boolean;
  specifications?: { label: string; value: string }[];
}

const initialState: VariantFormState = {};

export default function VariantForm({
  action,
  productId,
  defaults,
  submitLabel,
}: {
  action: (prevState: VariantFormState, formData: FormData) => Promise<VariantFormState>;
  productId: string;
  defaults?: VariantDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}
      <input type="hidden" name="productId" value={productId} />

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput
        label="Etichetă variantă"
        name="label"
        required
        defaultValue={defaults?.label}
        placeholder="ex: 25 m²  sau  9000 BTU"
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Preț (MDL)"
          name="price"
          type="number"
          required
          defaultValue={defaults?.price}
          placeholder="10540"
        />
        <AdminInput
          label="Preț vechi (opțional)"
          name="oldPrice"
          type="number"
          defaultValue={defaults?.oldPrice ?? ""}
          placeholder="12000"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Suprafață (m²)"
          name="surface"
          type="number"
          defaultValue={defaults?.surface ?? ""}
          placeholder="25"
        />
        <AdminInput
          label="BTU"
          name="btu"
          type="number"
          defaultValue={defaults?.btu ?? ""}
          placeholder="9000"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="Badge (opțional)"
          name="badge"
          defaultValue={defaults?.badge ?? ""}
          placeholder="ex: -10%  sau  Popular"
        />
        <AdminInput
          label="Ordine afișare"
          name="order"
          type="number"
          defaultValue={defaults?.order ?? 0}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-600">Disponibilitate</label>
        <select
          name="availability"
          defaultValue={defaults?.availability ?? "În stoc"}
          className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
        >
          <option value="În stoc">În stoc</option>
          <option value="Stoc epuizat">Stoc epuizat</option>
          <option value="La comandă">La comandă</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={defaults?.isDefault ?? false}
          className="w-4 h-4 accent-[#c7092b]"
        />
        Variantă implicită (selectată automat pe pagina produsului)
      </label>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Specificații tehnice pentru această variantă (opțional)
        </p>
        <p className="text-xs text-gray-400 mb-3">
          Dacă completezi, înlocuiesc specificațiile produsului de bază când e selectată această variantă.
        </p>
        <SpecificationsEditor defaultValue={defaults?.specifications} useTemplate={false} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide mt-2"
      >
        {pending ? "Se salvează..." : submitLabel}
      </button>
    </form>
  );
}
