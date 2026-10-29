# Biomass Value Match — AI-Driven Biomass Valorization Platform
> **Problem Solving in Engineering — I (PSE External Project)**  
> **Anurag University, Hyderabad, Telangana**

An interactive, simulated decision-support system and industrial valorization platform designed to demonstrate how agricultural and agro-processing residues (paddy husk, rice straw, coconut shells, groundnut hulls, bagasse, maize cobs, coffee husks) can be systematically characterized, matched with industrial buyers, and routed toward productive circular reuse across Telangana.

---

## 👥 Project Team & Academic Credits

- **Course Context:** Problem Solving in Engineering — I (PSE-I External Project)
- **Institution:** Anurag University, Venkatapur, Ghatkesar, Hyderabad, Telangana

### Project Team Members
1. **Laasya Kondoori**
2. **T. Bhavya Shree**
3. **K. Tanishka Reddy**
4. **B. Parameswaran**
5. **K. Chumanesh**

### Project Guide
- **Shilpa Shesham**, Department of Engineering, Anurag University

---

## 🌟 Key Platform Modules

| Module | Description | Key Features |
| :--- | :--- | :--- |
| **1. Overview Dashboard** | Macro supply-demand exchange | Dynamic KPI cards, circular supply-to-demand flow schematic, Recharts supply breakdown, recommended matches table. |
| **2. Residue Inventory** | Standardized feedstock registry | 18 seeded synthetic batches across Telangana, multi-criteria filtering, laboratory assay tracking, "Not measured" honest handling, batch drawer, edit/delete actions. |
| **3. Add Residue Batch** | Supplier & feedstock onboarding | 4-section wizard (Supplier, Material & Proximate Labs, Preferred Pathway, Review with missing data alerts). |
| **4. Material Recovery Lab** *(Key Differentiator)* | Scientific valorization matrix | Clear separation of Mineral Recovery (Amorphous Silica Ash from Rice Husk) vs. Carbon Recovery (Biochar, Activated Carbon). Visual step flow and side-by-side comparative matrix. |
| **5. Industry Buyer Network** | Verified demand registry | 16 fictional industrial profiles across 8 sectors with explicit intake windows, moisture ceilings, distance radiuses, and price bands. |
| **6. Smart Matching Engine** *(Core Engine)* | Explainable decision engine | Deterministic 5-step rules-based matching algorithm with configurable weights (Material 35%, Quantity 20%, Quality 20%, Distance 15%, Economics 10%). Shows eligible matches with net simulated margins and explicit rejection reasons for failing buyers. |
| **7. Collection & Logistics** | Simulated dispatch & aggregation | Multi-batch aggregation planner (combines compatible smallholder loads into a legal truckload), freight cost calculations (₹/kg), and status tracker (Proposed → Scheduled → Picked Up → Delivered). |
| **8. Transactions & Verification** | End-to-end circular audit trail | Full status stepper, rejection workflow with audited technical reasons, delivery confirmation, and simulated end-use verification evidence. |
| **9. Analytics & Reporting** | Real-time performance insights | Live recalculations of acceptance rate, pipeline funnel, regional supply by district, verified end-use pie chart, and 1-click CSV export. |
| **10. Project Information** | Academic documentation | System boundary diagrams, rules-based engine justification vs. black-box ML, and educational simulation disclaimers. |

---

## 🚀 Quick Start & Run Instructions

The application is completely self-contained and runs locally without any API keys, external databases, cloud credentials, or paid third-party services.

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v24.18)
- [npm](https://www.npmjs.com/) v9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open your browser at `http://localhost:5173` (or the URL displayed in the terminal).

### 3. Build for Production Preview
```bash
npm run build
npm run preview
```

---

## 🎯 Repeatable 8-Step Presentation Walkthrough

Click the **"Guided Tour"** or **"Load Demo Scenario"** button in the top navigation bar to access the interactive presentation stepper designed for college evaluations:

1. **Overview Dashboard:** Review total regional supply (670+ tonnes) and explain the circular routing schematic.
2. **Residue Inventory:** Inspect batch `BATCH-RH-2026-001` (45 tonnes of Rice Husk from Nizamabad) and highlight the data confidence rating.
3. **Material Recovery Lab:** Open the comparative matrix to compare *Silica-Rich Ash Recovery* (mineral route) versus *Biochar Production* (carbonaceous route).
4. **Smart Matching Engine:** Execute the rules-based algorithm on the Nizamabad batch. Observe top match *Telangana Advanced Silicates* (Score 94/100) and review why other buyers were rejected.
5. **Simulate Buyer Intent:** Click *Simulate Buyer Request* to generate a simulated purchase offer at ₹4,900/tonne.
6. **Logistics Coordination:** Navigate to *Collection & Logistics*, assign a 50-tonne multi-axle truck, review the ₹0.49/kg freight economics, and advance status to *Scheduled*.
7. **End-Use Verification:** In *Transactions*, confirm gate delivery and record simulated QA evidence (*Weighbridge #WB-8492, XRD Amorphous Silica 99.1%*).
8. **Live Analytics & Export:** Check the live KPI updates in *Analytics* and download the full dataset as CSV.

---

## 🔬 Explainable Matching Algorithm Methodology

The matching engine uses a deterministic, 5-step rules-based evaluation rather than a black-box model:

$$\text{Score} = \frac{W_{\text{mat}} \cdot S_{\text{mat}} + W_{\text{qty}} \cdot S_{\text{qty}} + W_{\text{qual}} \cdot S_{\text{qual}} + W_{\text{dist}} \cdot S_{\text{dist}} + W_{\text{econ}} \cdot S_{\text{econ}}}{\sum W}$$

- **Material & Pathway Compatibility (35%):** Strict gating. The buyer must accept both the residue type and the chosen processing route.
- **Quantity Window Fit (20%):** Assesses batch volume relative to buyer minimum/maximum batch limits.
- **Quality & Laboratory Compliance (20%):** Validates moisture and ash ceilings. If moisture is unmeasured, the match is marked as *Provisional*.
- **Logistics & Distance (15%):** Evaluates distance against the buyer's maximum allowable haulage radius.
- **Economic Attractiveness (10%):** Estimates net deliverable margin:
  $$\text{Net Value} = \text{Gross Value} - \text{Estimated Transport Cost} - \text{Estimated Processing Cost}$$

*Rule: Any buyer violating mandatory constraints is marked strictly Ineligible with specific rejection reasons displayed.*

---

## ⚖️ Academic Simulation Disclaimer

This application is an educational software proof-of-concept for **Problem Solving in Engineering — I at Anurag University**. All company profiles, contact numbers, transport trips, prices, and end-use certificates are synthetic demo records generated for prototype validation. No real financial transactions or commercial contracts occur.
