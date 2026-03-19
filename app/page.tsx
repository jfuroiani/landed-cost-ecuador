"use client";

import { useMemo, useState } from "react";

const money = (n: number) =>
  new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);

const num = (v: string) => {
  const n = parseFloat(v || "0");
  return Number.isFinite(n) ? n : 0;
};

export default function Page() {
  const [producto, setProducto] = useState("Laptop 14 pulgadas");
  const [incoterm, setIncoterm] = useState("FOB");
  const [unidades, setUnidades] = useState("100");
  const [costoUnitario, setCostoUnitario] = useState("250");
  const [flete, setFlete] = useState("1200");
  const [seguro, setSeguro] = useState("120");
  const [gastosDestino, setGastosDestino] = useState("350");
  const [agenteAduana, setAgenteAduana] = useState("250");
  const [otros, setOtros] = useState("0");
  const [arancel, setArancel] = useState("10");
  const [fodinfa, setFodinfa] = useState("0.5");
  const [iva, setIva] = useState("15");
  const [ice, setIce] = useState("0");

  const [aplicaIsd, setAplicaIsd] = useState(true);
  const [tasaIsd, setTasaIsd] = useState("5");
  const [baseIsdModo, setBaseIsdModo] = useState("mercaderia");
  const [baseIsdManual, setBaseIsdManual] = useState("0");

  const r = useMemo(() => {
    const qty = num(unidades);
    const mercaderia = qty * num(costoUnitario);
    let fob = mercaderia;
    let cif = mercaderia;

    if (incoterm === "FOB") cif = fob + num(flete) + num(seguro);
    if (incoterm === "CIF") cif = mercaderia;
    if (incoterm === "EXW") {
      fob = mercaderia;
      cif = fob + num(flete) + num(seguro);
    }

    const base = cif;
    const vArancel = base * (num(arancel) / 100);
    const vFodinfa = base * (num(fodinfa) / 100);
    const vIce = base * (num(ice) / 100);
    const baseIva = base + vArancel + vFodinfa + vIce;
    const vIva = baseIva * (num(iva) / 100);

    let baseIsd = 0;
    if (baseIsdModo === "mercaderia") baseIsd = mercaderia;
    if (baseIsdModo === "mercaderia_flete") baseIsd = mercaderia + num(flete);
    if (baseIsdModo === "mercaderia_flete_seguro") {
      baseIsd = mercaderia + num(flete) + num(seguro);
    }
    if (baseIsdModo === "manual") baseIsd = num(baseIsdManual);

    const vIsd = aplicaIsd ? baseIsd * (num(tasaIsd) / 100) : 0;

    const extras = num(gastosDestino) + num(agenteAduana) + num(otros);
    const total = cif + vArancel + vFodinfa + vIce + vIva + extras + vIsd;
    const unitario = qty > 0 ? total / qty : 0;

    return {
      mercaderia,
      fob,
      cif,
      vArancel,
      vFodinfa,
      vIce,
      vIva,
      vIsd,
      baseIsd,
      extras,
      total,
      unitario,
    };
  }, [
    incoterm,
    unidades,
    costoUnitario,
    flete,
    seguro,
    gastosDestino,
    agenteAduana,
    otros,
    arancel,
    fodinfa,
    iva,
    ice,
    aplicaIsd,
    tasaIsd,
    baseIsdModo,
    baseIsdManual,
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">Calculadora Landed Cost Ecuador</h1>
        <p className="text-sm text-gray-600">
          Estimación rápida para importaciones desde la Feria de Cantón.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-semibold">Datos base</h2>
            <div className="grid gap-3">
              <label>
                <div className="mb-1 text-sm">Producto</div>
                <input
                  className="w-full rounded-lg border p-2"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Incoterm</div>
                <select
                  className="w-full rounded-lg border p-2"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value)}
                >
                  <option>EXW</option>
                  <option>FOB</option>
                  <option>CIF</option>
                </select>
              </label>

              <label>
                <div className="mb-1 text-sm">Unidades</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={unidades}
                  onChange={(e) => setUnidades(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Costo unitario</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Flete</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={flete}
                  onChange={(e) => setFlete(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Seguro</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={seguro}
                  onChange={(e) => setSeguro(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Gastos en destino</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={gastosDestino}
                  onChange={(e) => setGastosDestino(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Agente de aduana</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={agenteAduana}
                  onChange={(e) => setAgenteAduana(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Otros costos</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={otros}
                  onChange={(e) => setOtros(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Arancel %</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={arancel}
                  onChange={(e) => setArancel(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">FODINFA %</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={fodinfa}
                  onChange={(e) => setFodinfa(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">IVA %</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">ICE %</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={ice}
                  onChange={(e) => setIce(e.target.value)}
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow">
            <h2 className="mb-4 text-xl font-semibold">ISD</h2>
            <div className="grid gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aplicaIsd}
                  onChange={(e) => setAplicaIsd(e.target.checked)}
                />
                <span className="text-sm">Aplicar ISD</span>
              </label>

              <label>
                <div className="mb-1 text-sm">Tasa ISD %</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={tasaIsd}
                  onChange={(e) => setTasaIsd(e.target.value)}
                />
              </label>

              <label>
                <div className="mb-1 text-sm">Base ISD</div>
                <select
                  className="w-full rounded-lg border p-2"
                  value={baseIsdModo}
                  onChange={(e) => setBaseIsdModo(e.target.value)}
                >
                  <option value="mercaderia">Solo mercadería</option>
                  <option value="mercaderia_flete">Mercadería + flete</option>
                  <option value="mercaderia_flete_seguro">
                    Mercadería + flete + seguro
                  </option>
                  <option value="manual">Manual</option>
                </select>
              </label>

              {baseIsdModo === "manual" && (
                <label>
                  <div className="mb-1 text-sm">Base ISD manual</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={baseIsdManual}
                    onChange={(e) => setBaseIsdManual(e.target.value)}
                  />
                </label>
              )}

              <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Base ISD calculada</span>
                  <strong>{money(r.baseIsd)}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-4 shadow">
          <h2 className="mb-4 text-xl font-semibold">Resultado</h2>
          <div className="space-y-3">
            <div className="rounded-xl bg-black p-4 text-white">
              <div className="text-sm text-gray-300">Costo landed total</div>
              <div className="text-3xl font-bold">{money(r.total)}</div>
              <div className="mt-1 text-sm text-gray-300">
                Unitario: {money(r.unitario)}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex justify-between rounded-lg border p-3"><span>Valor mercancía</span><strong>{money(r.mercaderia)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>FOB</span><strong>{money(r.fob)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>CIF</span><strong>{money(r.cif)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>Arancel</span><strong>{money(r.vArancel)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>FODINFA</span><strong>{money(r.vFodinfa)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>ICE</span><strong>{money(r.vIce)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>IVA</span><strong>{money(r.vIva)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>ISD</span><strong>{money(r.vIsd)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3 md:col-span-2"><span>Extras</span><strong>{money(r.extras)}</strong></div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}