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

  /**
   * Convert simulation results to formatted string for prompt injection
   * @param {Object} results - Results from calculate() method
   * @returns {string} Formatted string representation
   */
  toString(results) {
    return `Les résultats de simulation sont disponibles:

Régime Micro-BIC:
- Revenus annuels après charges: ${results.micro_bic.revenus.toFixed(2)}€
- Impôts: ${results.micro_bic.impots.toFixed(2)}€
- Net après impôts: ${results.micro_bic.net_apres_impots.toFixed(2)}€

Régime Réel:
- Revenus annuels après charges: ${results.reel.revenus.toFixed(2)}€
- Impôts: ${results.reel.impots.toFixed(2)}€
- Net après impôts: ${results.reel.net_apres_impots.toFixed(2)}€

Tu peux maintenant expliquer ces résultats à l'utilisateur et lui donner des conseils sur quel régime est le plus avantageux pour lui.`;
  }
}

export default TaxSimulator

