"use client";

import { useMemo, useState, useEffect } from "react";

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

type PresetEspecifico =
  | "manual"
  | "monitor_tv"
  | "ropa_courier"
  | "calzado_courier";

type Incoterm = "EXW" | "FCA" | "FOB" | "CFR" | "CIF" | "DAP" | "DPU";

export default function Page() {
  const [producto, setProducto] = useState("Laptop 14 pulgadas");
  const [incoterm, setIncoterm] = useState<Incoterm>("FOB");
  const [unidades, setUnidades] = useState("100");
  const [costoUnitario, setCostoUnitario] = useState("250");

  const [gastosOrigen, setGastosOrigen] = useState("0");
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

  const [aplicaEspecifico, setAplicaEspecifico] = useState(false);
  const [presetEspecifico, setPresetEspecifico] =
    useState<PresetEspecifico>("manual");
  const [unidadEspecifico, setUnidadEspecifico] = useState("u");
  const [tasaEspecificoUsd, setTasaEspecificoUsd] = useState("0");
  const [cantidadEspecifico, setCantidadEspecifico] = useState("0");
  const [pulgadas, setPulgadas] = useState("24");

  const [arancelesDB, setArancelesDB] = useState<any[]>([]);
  const [hsCode, setHsCode] = useState("");

  const [resultadosBusqueda, setResultadosBusqueda] = useState<any[]>([]);
  const [hsValido, setHsValido] = useState(true);
  const [descripcionHS, setDescripcionHS] = useState("");
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [mostrarDropdownHS, setMostrarDropdownHS] = useState(false);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/jfuroiani/landed-cost-aranceles-db/main/data/aranceles.json")
    .then(res => res.json())
    .then(data => setArancelesDB(data))
    .catch(err => console.error("Error cargando aranceles:", err));
  }, []);

  useEffect(() => {
    if (!hsCode) return;

    const item = arancelesDB.find(x => x.hs === hsCode);

    if (!item) return;

    setArancel(item.advalorem?.toString() || "0");
    setFodinfa(item.fodinfa?.toString() || "0.5");
    setIva(item.iva?.toString() || "15");
    setIce(item.ice?.toString() || "0");

    if (item.tipo === "especifico") {
      setAplicaEspecifico(true);
      setUnidadEspecifico(item.especifico.unidad);
      setTasaEspecificoUsd(item.especifico.usd.toString());
    }

    if (item.tipo === "mixto") {
      setAplicaEspecifico(true);
      setPresetEspecifico("monitor_tv");
    }

  }, [hsCode, arancelesDB]);

  const seleccionarPartida = (item: any) => {
    setHsCode(item.hs);
    setDescripcionHS(item.descripcion);
    setResultadosBusqueda([]);
    setHsValido(true);
    setIndiceSeleccionado(-1);
    setMostrarDropdownHS(false);

    setArancel(item.advalorem?.toString() || "0");
    setFodinfa(item.fodinfa?.toString() || "0.5");
    setIva(item.iva?.toString() || "15");
    setIce(item.ice?.toString() || "0");

    if (item.tipo === "especifico") {
      setAplicaEspecifico(true);
      setPresetEspecifico("manual");
      setUnidadEspecifico(item.especifico.unidad);
      setTasaEspecificoUsd(item.especifico.usd.toString());
    }

    if (item.tipo === "mixto") {
      setAplicaEspecifico(true);
      setPresetEspecifico("monitor_tv");
    }
  };

  const manejarTecladoHS = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!resultadosBusqueda.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev < resultadosBusqueda.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSeleccionado((prev) =>
        prev > 0 ? prev - 1 : resultadosBusqueda.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (indiceSeleccionado >= 0 && resultadosBusqueda[indiceSeleccionado]) {
        seleccionarPartida(resultadosBusqueda[indiceSeleccionado]);
      }
    }

    if (e.key === "Escape") {
      setResultadosBusqueda([]);
      setIndiceSeleccionado(-1);
      setMostrarDropdownHS(false);
    }
  };

  useEffect(() => {
    if (!hsCode) {
      setResultadosBusqueda([]);
      setDescripcionHS("");
      setHsValido(true);
      setIndiceSeleccionado(-1);
      setMostrarDropdownHS(false);
      return;
    }

    const texto = hsCode.toLowerCase();

    const resultados = arancelesDB.filter((item) =>
      item.hs.includes(texto) ||
      item.descripcion.toLowerCase().includes(texto)
    );

    setResultadosBusqueda(resultados.slice(0, 5));
    setIndiceSeleccionado(-1);

    const exacto = arancelesDB.find((x) => x.hs === hsCode);

    if (exacto) {
      setHsValido(true);
      setDescripcionHS(exacto.descripcion);
    } else {
      setHsValido(false);
      setDescripcionHS("");
    }
  }, [hsCode, arancelesDB]);

  const mostrarGastosOrigen = incoterm === "EXW";
  const mostrarFlete =
    incoterm === "EXW" || incoterm === "FCA" || incoterm === "FOB";
  const mostrarSeguro =
    incoterm === "EXW" ||
    incoterm === "FCA" ||
    incoterm === "FOB" ||
    incoterm === "CFR";

  const etiquetaCostoUnitario = (() => {
    if (incoterm === "EXW") return "Costo unitario EXW";
    if (incoterm === "FCA") return "Costo unitario FCA";
    if (incoterm === "FOB") return "Costo unitario FOB";
    if (incoterm === "CFR") return "Costo unitario CFR";
    if (incoterm === "CIF") return "Costo unitario CIF";
    if (incoterm === "DAP") return "Costo unitario DAP";
    return "Costo unitario DPU";
  })();

  const r = useMemo(() => {
    const qty = num(unidades);
    const mercaderiaBase = qty * num(costoUnitario);

    let gastosOrigenCalc = 0;
    let fleteCalc = 0;
    let seguroCalc = 0;
    let fob = 0;
    let cif = 0;
    let mercaderia = mercaderiaBase;

    if (incoterm === "EXW") {
      gastosOrigenCalc = num(gastosOrigen);
      fleteCalc = num(flete);
      seguroCalc = num(seguro);
      fob = mercaderiaBase + gastosOrigenCalc;
      cif = fob + fleteCalc + seguroCalc;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "FCA") {
      fleteCalc = num(flete);
      seguroCalc = num(seguro);
      fob = mercaderiaBase;
      cif = fob + fleteCalc + seguroCalc;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "FOB") {
      fleteCalc = num(flete);
      seguroCalc = num(seguro);
      fob = mercaderiaBase;
      cif = fob + fleteCalc + seguroCalc;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "CFR") {
      seguroCalc = num(seguro);
      fob = mercaderiaBase - num(flete);
      cif = mercaderiaBase + seguroCalc;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "CIF") {
      fob = mercaderiaBase;
      cif = mercaderiaBase;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "DAP") {
      fob = mercaderiaBase;
      cif = mercaderiaBase;
      mercaderia = mercaderiaBase;
    }

    if (incoterm === "DPU") {
      fob = mercaderiaBase;
      cif = mercaderiaBase;
      mercaderia = mercaderiaBase;
    }

    let arancelAdvaloremAjustado = num(arancel);

    let unidadEspecificoCalc = unidadEspecifico;
    let tasaEspecificoCalc = num(tasaEspecificoUsd);
    let cantidadEspecificoCalc = num(cantidadEspecifico);
    let notaEspecifico = "";

    if (presetEspecifico === "monitor_tv") {
      unidadEspecificoCalc = "u";
      cantidadEspecificoCalc = qty;

      const inches = num(pulgadas);
      if (inches <= 20) {
        tasaEspecificoCalc = 0;
        arancelAdvaloremAjustado = 5;
        notaEspecifico = "Hasta 20 pulgadas: 5% ad-valorem y sin específico.";
      } else if (inches <= 32) {
        tasaEspecificoCalc = 73.11;
        arancelAdvaloremAjustado = 5;
        notaEspecifico = "Mayor a 20 y hasta 32 pulgadas: 5% + USD 73,11 c/u.";
      } else if (inches <= 41) {
        tasaEspecificoCalc = 140.32;
        arancelAdvaloremAjustado = 5;
        notaEspecifico = "Mayor a 32 y hasta 41 pulgadas: 5% + USD 140,32 c/u.";
      } else if (inches <= 75) {
        tasaEspecificoCalc = 158.14;
        arancelAdvaloremAjustado = 5;
        notaEspecifico = "Mayor a 41 y hasta 75 pulgadas: 5% + USD 158,14 c/u.";
      } else {
        tasaEspecificoCalc = 0;
        arancelAdvaloremAjustado = 20;
        notaEspecifico = "Mayor a 75 pulgadas: 20% ad-valorem y sin específico.";
      }
    }

    if (presetEspecifico === "ropa_courier") {
      unidadEspecificoCalc = "kg";
      tasaEspecificoCalc = 5.5;
      notaEspecifico = "Preset courier: USD 5,50 por kg.";
    }

    if (presetEspecifico === "calzado_courier") {
      unidadEspecificoCalc = "par";
      tasaEspecificoCalc = 6;
      notaEspecifico = "Preset courier: USD 6,00 por par.";
    }

    const vEspecifico = aplicaEspecifico
      ? tasaEspecificoCalc * cantidadEspecificoCalc
      : 0;

    const base = cif;
    const vArancel = base * (arancelAdvaloremAjustado / 100);
    const vFodinfa = base * (num(fodinfa) / 100);
    const vIce = base * (num(ice) / 100);
    const baseIva = base + vArancel + vFodinfa + vIce;
    const vIva = baseIva * (num(iva) / 100);

    let baseIsd = 0;
    if (baseIsdModo === "mercaderia") baseIsd = mercaderia;
    if (baseIsdModo === "mercaderia_flete") baseIsd = mercaderia + fleteCalc;
    if (baseIsdModo === "mercaderia_flete_seguro") {
      baseIsd = mercaderia + fleteCalc + seguroCalc;
    }
    if (baseIsdModo === "manual") baseIsd = num(baseIsdManual);

    const vIsd = aplicaIsd ? baseIsd * (num(tasaIsd) / 100) : 0;

    const extras = num(gastosDestino) + num(agenteAduana) + num(otros);
    const total =
      cif + vArancel + vEspecifico + vFodinfa + vIce + vIva + vIsd + extras;
    const unitario = qty > 0 ? total / qty : 0;

    return {
      mercaderia,
      gastosOrigenCalc,
      fleteCalc,
      seguroCalc,
      fob,
      cif,
      arancelAdvaloremAjustado,
      vArancel,
      vEspecifico,
      unidadEspecificoCalc,
      tasaEspecificoCalc,
      cantidadEspecificoCalc,
      notaEspecifico,
      vFodinfa,
      vIce,
      vIva,
      baseIsd,
      vIsd,
      extras,
      total,
      unitario,
    };
  }, [
    incoterm,
    unidades,
    costoUnitario,
    gastosOrigen,
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
    aplicaEspecifico,
    presetEspecifico,
    unidadEspecifico,
    tasaEspecificoUsd,
    cantidadEspecifico,
    pulgadas,
  ]);

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold">Calculadora Landed Cost Ecuador</h1>
        <p className="text-sm text-gray-600">
          Lógica por Incoterm, ISD configurable y arancel específico.
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
               <div className="mb-1 text-sm">Partida arancelaria</div>
               <div className="relative">
                <input
                  className={`w-full rounded-lg border p-2 ${
                    hsValido ? "" : "border-red-500"
                  }`}
                  placeholder="Buscar por código o producto (ej: TV, camiseta...)"
                  value={hsCode}
                  onChange={(e) => {
                    setHsCode(e.target.value);
                    setMostrarDropdownHS(true);
                  }}
                  onKeyDown={manejarTecladoHS}
                />

                {/* Dropdown */}
                {mostrarDropdownHS && resultadosBusqueda.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow">
                    {resultadosBusqueda.map((item, i) => (
                      <div
                        key={i}
                        className={`cursor-pointer p-2 ${
                          i === indiceSeleccionado ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                        onMouseDown={() => seleccionarPartida(item)}
                      >
                        <div className="font-medium">{item.hs}</div>
                        <div className="text-xs text-gray-500">
                          {item.descripcion}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Descripción */}
              {descripcionHS && (
                <div className="mt-2 text-sm text-green-700">
                  {descripcionHS}
                </div>
              )}

              {/* Error */}
              {!hsValido && hsCode && (
                <div className="mt-2 text-sm text-red-500">
                  Partida no válida
                </div>
              )}
              </label>

              <label>
                <div className="mb-1 text-sm">Incoterm</div>
                <select
                  className="w-full rounded-lg border p-2"
                  value={incoterm}
                  onChange={(e) => setIncoterm(e.target.value as Incoterm)}
                >
                  <option value="EXW">EXW</option>
                  <option value="FCA">FCA</option>
                  <option value="FOB">FOB</option>
                  <option value="CFR">CFR</option>
                  <option value="CIF">CIF</option>
                  <option value="DAP">DAP</option>
                  <option value="DPU">DPU</option>
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
                <div className="mb-1 text-sm">{etiquetaCostoUnitario}</div>
                <input
                  className="w-full rounded-lg border p-2"
                  type="number"
                  value={costoUnitario}
                  onChange={(e) => setCostoUnitario(e.target.value)}
                />
              </label>

              {mostrarGastosOrigen && (
                <label>
                  <div className="mb-1 text-sm">Gastos en origen</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={gastosOrigen}
                    onChange={(e) => setGastosOrigen(e.target.value)}
                  />
                </label>
              )}

              {mostrarFlete && (
                <label>
                  <div className="mb-1 text-sm">Flete internacional</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={flete}
                    onChange={(e) => setFlete(e.target.value)}
                  />
                </label>
              )}

              {mostrarSeguro && (
                <label>
                  <div className="mb-1 text-sm">Seguro internacional</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={seguro}
                    onChange={(e) => setSeguro(e.target.value)}
                  />
                </label>
              )}

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
                <div className="mb-1 text-sm">Arancel ad-valorem %</div>
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
          <h2 className="mb-4 text-xl font-semibold">Arancel específico</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={aplicaEspecifico}
                  onChange={(e) => setAplicaEspecifico(e.target.checked)}
                />
                <span className="text-sm">Aplicar arancel específico</span>
              </label>

              <label>
                <div className="mb-1 text-sm">Preset</div>
                <select
                  className="w-full rounded-lg border p-2"
                  value={presetEspecifico}
                  onChange={(e) =>
                    setPresetEspecifico(e.target.value as PresetEspecifico)
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="monitor_tv">Monitor / TV por pulgadas</option>
                  <option value="ropa_courier">Ropa / textiles courier por kg</option>
                  <option value="calzado_courier">Calzado courier por par</option>
                </select>
              </label>

              {presetEspecifico === "manual" && (
                <>
                  <label>
                    <div className="mb-1 text-sm">Unidad física</div>
                    <select
                      className="w-full rounded-lg border p-2"
                      value={unidadEspecifico}
                      onChange={(e) => setUnidadEspecifico(e.target.value)}
                    >
                      <option value="u">Unidad</option>
                      <option value="kg">Kilogramo</option>
                      <option value="par">Par</option>
                    </select>
                  </label>

                  <label>
                    <div className="mb-1 text-sm">Tasa específica USD por UF</div>
                    <input
                      className="w-full rounded-lg border p-2"
                      type="number"
                      value={tasaEspecificoUsd}
                      onChange={(e) => setTasaEspecificoUsd(e.target.value)}
                    />
                  </label>

                  <label>
                    <div className="mb-1 text-sm">Cantidad UF</div>
                    <input
                      className="w-full rounded-lg border p-2"
                      type="number"
                      value={cantidadEspecifico}
                      onChange={(e) => setCantidadEspecifico(e.target.value)}
                    />
                  </label>
                </>
              )}

              {presetEspecifico === "monitor_tv" && (
                <>
                  <label>
                    <div className="mb-1 text-sm">Pulgadas</div>
                    <input
                      className="w-full rounded-lg border p-2"
                      type="number"
                      value={pulgadas}
                      onChange={(e) => setPulgadas(e.target.value)}
                    />
                  </label>
                  <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span>Cantidad base</span>
                      <strong>{r.cantidadEspecificoCalc} u</strong>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span>Tasa calculada</span>
                      <strong>{money(r.tasaEspecificoCalc)} c/u</strong>
                    </div>
                  </div>
                </>
              )}

              {presetEspecifico === "ropa_courier" && (
                <label>
                  <div className="mb-1 text-sm">Peso en kg</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={cantidadEspecifico}
                    onChange={(e) => setCantidadEspecifico(e.target.value)}
                  />
                </label>
              )}

              {presetEspecifico === "calzado_courier" && (
                <label>
                  <div className="mb-1 text-sm">Número de pares</div>
                  <input
                    className="w-full rounded-lg border p-2"
                    type="number"
                    value={cantidadEspecifico}
                    onChange={(e) => setCantidadEspecifico(e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="grid gap-3 content-start">
              <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Unidad física usada</span>
                  <strong>{r.unidadEspecificoCalc}</strong>
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Cantidad aplicada</span>
                  <strong>{r.cantidadEspecificoCalc}</strong>
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Tasa específica aplicada</span>
                  <strong>{money(r.tasaEspecificoCalc)}</strong>
                </div>
              </div>

              <div className="rounded-xl border bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Arancel específico total</span>
                  <strong>{money(r.vEspecifico)}</strong>
                </div>
              </div>

              <div className="rounded-xl border bg-yellow-50 p-3 text-sm text-gray-700">
                <strong>Nota:</strong> {r.notaEspecifico || "Modo manual: ingresa tu propia UF y tasa."}
              </div>
            </div>
          </div>
        </section>

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
              {incoterm === "EXW" && (
                <div className="flex justify-between rounded-lg border p-3"><span>Gastos en origen</span><strong>{money(r.gastosOrigenCalc)}</strong></div>
              )}
              {(incoterm === "EXW" || incoterm === "FCA" || incoterm === "FOB") && (
                <div className="flex justify-between rounded-lg border p-3"><span>Flete internacional</span><strong>{money(r.fleteCalc)}</strong></div>
              )}
              {(incoterm === "EXW" || incoterm === "FCA" || incoterm === "FOB" || incoterm === "CFR") && (
                <div className="flex justify-between rounded-lg border p-3"><span>Seguro internacional</span><strong>{money(r.seguroCalc)}</strong></div>
              )}
              <div className="flex justify-between rounded-lg border p-3"><span>FOB</span><strong>{money(r.fob)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>CIF</span><strong>{money(r.cif)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>Arancel ad-valorem aplicado</span><strong>{r.arancelAdvaloremAjustado}%</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>Arancel ad-valorem</span><strong>{money(r.vArancel)}</strong></div>
              <div className="flex justify-between rounded-lg border p-3"><span>Arancel específico</span><strong>{money(r.vEspecifico)}</strong></div>
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