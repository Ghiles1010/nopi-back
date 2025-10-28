/**
 * LMNP Tax Simulation Calculator
 * Compares Micro-BIC vs Régime réel tax regimes
 */
export class TaxSimulator {
  /**
   * Calculate simulation for both tax regimes
   * @param {Object} state - Investment state with prix_achat, loyer_mensuel, charges_annuelles, duree
   * @returns {Object} Simulation results for both regimes
   */
  calculate(state) {
    const revenus_mensuels = state.loyer_mensuel;
    const revenus_annuels = revenus_mensuels * 12 - state.charges_annuelles;
    
    // Micro-BIC regime
    const micro_bic_revenus_imposables = revenus_annuels * 0.7; // 30% abattement
    const micro_bic_impots = micro_bic_revenus_imposables * 0.30; // 30% TMI (taux moyen d'imposition)
    const micro_bic_net = revenus_annuels - micro_bic_impots;

    // Régime réel
    const amortissement_annuel = state.prix_achat / 20; // Amortissement linéaire sur 20 ans
    const reel_revenus_imposables = Math.max(0, revenus_annuels - amortissement_annuel);
    const reel_impots = reel_revenus_imposables * 0.30;
    const reel_net = revenus_annuels - reel_impots;

    return {
      micro_bic: {
        revenus: revenus_annuels,
        impots: micro_bic_impots,
        net_apres_impots: micro_bic_net,
      },
      reel: {
        revenus: revenus_annuels,
        impots: reel_impots,
        net_apres_impots: reel_net,
      },
    };
  }
}

export default TaxSimulator

