"use client";

import { useActionState } from "react";
import { AdminInput, AdminTextarea } from "../components/AdminField";
import ImageUploadField from "../components/ImageUploadField";
import MultiImageUploadField from "../components/MultiImageUploadField";
import ManagedSelect from "../components/ManagedSelect";
import SpecificationsEditor from "../components/SpecificationsEditor";
import type { ProductFormState } from "@/lib/adminProductActions";
import { createCategoryInlineAction, deleteCategoryInlineAction } from "@/lib/adminCategoryActions";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductDefaults {
  id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  oldPrice?: number | null;
  image?: string | null;
  images?: string[];
  btu?: number | null;
  technology?: string;
  brand?: string | null;
  energyClass?: string | null;
  badge?: string | null;
  availability?: string;
  installmentsEnabled?: boolean;
  categoryId?: string;
  specifications?: { label: string; value: string }[];
  model?: string | null;
  surface?: number | null;
  wifi?: boolean | null;
  features?: string | null;
  refrigerant?: string | null;
  seer?: number | null;
  scop?: number | null;
  color?: string | null;
  productType?: string | null;
}

const initialState: ProductFormState = {};

export default function ProductForm({
  action,
  defaults,
  categories,
  brands,
  submitLabel,
}: {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  categories: CategoryOption[];
  brands: string[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaultEnergyClasses = ["A", "A+", "A++", "A+++"];
  const energyClassOptions =
    defaults?.energyClass && !defaultEnergyClasses.includes(defaults.energyClass)
      ? [...defaultEnergyClasses, defaults.energyClass]
      : defaultEnergyClasses;

  const defaultBadges = ["A++", "Nou", "Reducere", "Cel mai vândut"];
  const badgeOptions =
    defaults?.badge && !defaultBadges.includes(defaults.badge)
      ? [...defaultBadges, defaults.badge]
      : defaultBadges;

  const defaultTechnologies = ["Inverter", "On/Off"];
  const technologyOptions =
    defaults?.technology && !defaultTechnologies.includes(defaults.technology)
      ? [...defaultTechnologies, defaults.technology]
      : defaultTechnologies;

  const brandOptions =
    defaults?.brand && !brands.includes(defaults.brand) ? [...brands, defaults.brand] : brands;

  const defaultAvailabilities = ["În stoc", "Stoc epuizat", "La comandă"];
  const availabilityOptions =
    defaults?.availability && !defaultAvailabilities.includes(defaults.availability)
      ? [...defaultAvailabilities, defaults.availability]
      : defaultAvailabilities;

  return (
    <form action={formAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 max-w-2xl">
      {defaults?.id && <input type="hidden" name="id" value={defaults.id} />}

      {state.error && (
        <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">{state.error}</p>
      )}

      <AdminInput label="Nume produs" name="name" required defaultValue={defaults?.name} placeholder="Daikin Sensira FTXF35E" />
      <AdminInput label="Slug" name="slug" required defaultValue={defaults?.slug} placeholder="daikin-sensira-ftxf35e" />
      <AdminTextarea label="Descriere" name="description" defaultValue={defaults?.description ?? ""} placeholder="Descrierea produsului..." rows={3} />

      <ManagedSelect
        name="categoryId"
        label="Categorie"
        required
        defaultOptions={categories.map((c) => ({ value: c.id, label: c.name }))}
        defaultValue={defaults?.categoryId}
        emptyOptionLabel="Alege o categorie"
        addPlaceholder="Nume categorie nouă"
        deleteConfirmText="Sigur vrei să ștergi această categorie? Funcționează doar dacă niciun produs nu o folosește."
        onAdd={async (label) => {
          const formData = new FormData();
          formData.set("name", label);
          const result = await createCategoryInlineAction(formData);
          if (result.error || !result.category) return { error: result.error ?? "Nu am putut crea categoria." };
          return { option: { value: result.category.id, label: result.category.name } };
        }}
        onDelete={async (option) => {
          const result = await deleteCategoryInlineAction(option.value);
          if (result.error) return { error: result.error };
        }}
      />

      <ManagedSelect
        name="brand"
        label="Brand (opțional)"
        defaultOptions={brandOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.brand ?? ""}
        emptyOptionLabel="Fără brand"
        addPlaceholder="Brand nou, ex: Samsung"
        deleteConfirmText="Sigur vrei să ștergi acest brand din listă?"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="Preț (MDL)" name="price" type="number" required defaultValue={defaults?.price} placeholder="12999" />
        <AdminInput label="Preț vechi (opțional)" name="oldPrice" type="number" defaultValue={defaults?.oldPrice ?? ""} placeholder="14999" />
      </div>

      <ImageUploadField name="image" label="Imagine principală" defaultValue={defaults?.image} />
      <MultiImageUploadField name="images" label="Galerie imagini (opțional)" defaultValue={defaults?.images} />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput label="BTU (opțional)" name="btu" type="number" defaultValue={defaults?.btu ?? ""} placeholder="12000" />
        <ManagedSelect
          name="energyClass"
          label="Clasă energetică"
          defaultOptions={energyClassOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.energyClass ?? ""}
          addPlaceholder="ex: B"
          deleteConfirmText="Sigur vrei să ștergi această clasă energetică din listă?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
      </div>

      <SpecificationsEditor defaultValue={defaults?.specifications} />

      {/* ── Câmpuri catalog Gree ── */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Date tehnice catalog</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <AdminInput label="Cod model (opțional)" name="model" defaultValue={defaults?.model ?? ""} placeholder="GWH09AAAXB-K6DNA4B" />
          <AdminInput label="Suprafață (m², opțional)" name="surface" type="number" defaultValue={defaults?.surface ?? ""} placeholder="25" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <AdminInput label="Agent frigorific (opțional)" name="refrigerant" defaultValue={defaults?.refrigerant ?? ""} placeholder="R32" />
          <AdminInput label="Culoare (opțional)" name="color" defaultValue={defaults?.color ?? ""} placeholder="Alb / Gri / Negru" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <AdminInput label="SEER (opțional)" name="seer" type="number" defaultValue={defaults?.seer ?? ""} placeholder="6.3" />
          <AdminInput label="SCOP (opțional)" name="scop" type="number" defaultValue={defaults?.scop ?? ""} placeholder="4.0" />
        </div>

        <AdminInput label="Tip echipament (opțional)" name="productType" defaultValue={defaults?.productType ?? ""} placeholder="Sistem split de perete" />

        <AdminTextarea label="Funcții / dotări (opțional)" name="features" defaultValue={defaults?.features ?? ""} placeholder="Ionizare; Wi-Fi; Auto-curățare..." rows={3} />

        <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mt-2">
          <input
            type="checkbox"
            name="wifi"
            defaultChecked={defaults?.wifi ?? false}
            className="w-4 h-4 accent-[#c7092b]"
          />
          WiFi integrat
        </label>
      </div>

      <ManagedSelect
        name="badge"
        label="Badge (opțional)"
        defaultOptions={badgeOptions.map((value) => ({ value, label: value }))}
        defaultValue={defaults?.badge ?? ""}
        addPlaceholder="Eticheta nouă, ex: Top vânzări"
        deleteConfirmText="Sigur vrei să ștergi acest badge din listă?"
        onAdd={async (label) => ({ option: { value: label, label } })}
        onDelete={async () => {}}
      />

      <div className="grid grid-cols-2 gap-4">
        <ManagedSelect
          name="technology"
          label="Tehnologie"
          defaultOptions={technologyOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.technology ?? "On/Off"}
          addPlaceholder="ex: Dual Inverter"
          deleteConfirmText="Sigur vrei să ștergi această tehnologie din listă?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
        <ManagedSelect
          name="availability"
          label="Disponibilitate"
          defaultOptions={availabilityOptions.map((value) => ({ value, label: value }))}
          defaultValue={defaults?.availability ?? "În stoc"}
          addPlaceholder="ex: La comandă"
          deleteConfirmText="Sigur vrei să ștergi această opțiune de disponibilitate?"
          onAdd={async (label) => ({ option: { value: label, label } })}
          onDelete={async () => {}}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-bold text-gray-600">
        <input
          type="checkbox"
          name="installmentsEnabled"
          defaultChecked={defaults?.installmentsEnabled ?? true}
          className="w-4 h-4 accent-[#c7092b]"
        />
        Disponibil în rate (afișează butonul &quot;Cumpără în rate&quot;)
      </label>

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
