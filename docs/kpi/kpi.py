# gera_graficos_kpi.py
import re
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

# -------------------------
# Helpers para extrair número
# -------------------------
def extrai_numero(texto):
    """
    Extrai o primeiro número (inteiro ou float) encontrado na string.
    Retorna float ou NaN se não encontrar.
    Exemplos: "18 issues" -> 18.0, "75%" -> 75.0, "2,5 dias" -> 2.5
    """
    if pd.isna(texto):
        return float("nan")
    # normalizar vírgula decimal para ponto
    s = str(texto).replace(",", ".")
    # remover sinais ≥ ≤ para facilitar
    s = s.replace("≥", "").replace("≤", "")
    m = re.search(r"(-?\d+(\.\d+)?)", s)
    if m:
        try:
            return float(m.group(1))
        except:
            return float("nan")
    return float("nan")

# -------------------------
# Carregar dados
# -------------------------
file_path = "Indicadores_Powp.xlsx"   # ajuste se estiver em outra pasta
df = pd.read_excel(file_path, sheet_name="KPI")

# Criar colunas numéricas para plot
df["Valor_Num"] = df["Valor Atual"].apply(extrai_numero)
df["Meta_Num"] = df["Meta"].apply(extrai_numero)

# Onde valores faltarem, evitar crash com 0 ou NaN
# (mantemos NaN para indicar ausência)
# -------------------------
# 1) Gráfico comparativo: Valor Atual x Meta (barras agrupadas)
# -------------------------
ind = np.arange(len(df))
width = 0.35

fig, ax = plt.subplots(figsize=(12, 6))
bars1 = ax.bar(ind - width/2, df["Valor_Num"], width, label="Atual")
bars2 = ax.bar(ind + width/2, df["Meta_Num"], width, label="Meta", alpha=0.75)

ax.set_ylabel("Valor (numérico extraído)")
ax.set_title("KPIs - Comparativo Atual x Meta")
ax.set_xticks(ind)
ax.set_xticklabels(df["Indicador"], rotation=35, ha="right")
ax.legend()

# anotar valores em cima das barras
def anotar_barras(bars, ax):
    for b in bars:
        h = b.get_height()
        if not np.isnan(h):
            ax.annotate(f'{h:.2f}',
                        xy=(b.get_x() + b.get_width() / 2, h),
                        xytext=(0, 3),  # 3 points vertical offset
                        textcoords="offset points",
                        ha='center', va='bottom', fontsize=9)

anotar_barras(bars1, ax)
anotar_barras(bars2, ax)

plt.tight_layout()
fig.savefig("kpis_comparativo_atual_meta.png", dpi=150)
plt.close(fig)

# -------------------------
# 2) Pizza: distribuição dos Status
# -------------------------
status_counts = df["Status"].fillna("Sem status").value_counts()

fig2, ax2 = plt.subplots(figsize=(7,7))
ax2.pie(status_counts, labels=status_counts.index, autopct="%1.1f%%", startangle=90)
ax2.set_title("Distribuição de Status dos KPIs")
plt.tight_layout()
fig2.savefig("kpis_status_pizza.png", dpi=150)
plt.close(fig2)

# -------------------------
# 3) Barras horizontais: Valor Atual por Indicador (anotado)
# -------------------------
fig3, ax3 = plt.subplots(figsize=(10, 6))
y_pos = np.arange(len(df))
vals = df["Valor_Num"].fillna(0)  # usa 0 onde estiver NaN só para plotar; você pode filtrar se preferir

barsh = ax3.barh(y_pos, vals, align='center')
ax3.set_yticks(y_pos)
ax3.set_yticklabels(df["Indicador"])
ax3.invert_yaxis()  # maior em cima
ax3.set_xlabel("Valor (numérico extraído)")
ax3.set_title("Valor Atual por Indicador")

# anotar valores
for i, v in enumerate(vals):
    ax3.text(v + max(vals)*0.01, i, f"{v:.2f}", va='center', fontsize=9)

plt.tight_layout()
fig3.savefig("kpis_valores_horizontais.png", dpi=150)
plt.close(fig3)

print("Gráficos gerados e salvos como:")
print(" - kpis_comparativo_atual_meta.png")
print(" - kpis_status_pizza.png")
print(" - kpis_valores_horizontais.png")
