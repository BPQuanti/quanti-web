/**
 * Generates dynamic, creative "AI-style" insights based on 4 key performance metrics.
 * 
 * @param {Object} stats - Object containing the 4 metrics.
 * @param {number} stats.value - Current metric value.
 * @param {number} stats.target - Target goal.
 * @param {number} stats.baseline - Previous period or baseline value.
 * @param {string} stats.metricName - Name of the metric (e.g., "Monthly Revenue", "Daily Active Users").
 * @returns {Object} An object containing the generated wild insight, tone, and performance tier.
 */
export function generateWildAIInsight({ value, target, baseline, metricName }) {
    // 1. Calculate relative performance metrics
    const pctOfTarget = (value / target) * 100;
    const growthRate = ((value - baseline) / baseline) * 100;
    
    // 2. Templates categorized by performance tiers
    const templates = {
      legendary: [
        `🚀 **Hyperdrive Engaged!** ${metricName} smashed through its baseline by ${growthRate.toFixed(1)}%, hitting ${pctOfTarget.toFixed(1)}% of target. The algorithms predict a quantum leap if momentum holds.`,
        `💥 **Breakout Anomaly Detected:** ${metricName} reached ${value}, surpassing the ${target} goal. You are breaking the model parameters!`,
        `🌟 **God-Mode Performance:** Growth for ${metricName} is spiking at +${growthRate.toFixed(1)}%. We might need to rewrite physics at this rate.`
      ],
      solid: [
        `📈 **Steady Climb:** ${metricName} sits at ${pctOfTarget.toFixed(1)}% of goal (${value}/${target}). The trajectory is stable and tracking green.`,
        `⚡ **Positive Momentum:** Outperforming baseline by +${growthRate.toFixed(1)}%. Keep feeding energy into ${metricName}.`,
        `🎯 **On the Radar:** ${metricName} is quietly closing in on its target. Standard optimization routines are delivering solid gains.`
      ],
      needsWork: [
        `⚠️ **Anomaly Warning:** ${metricName} is currently at ${pctOfTarget.toFixed(1)}% of target. Pivot routines suggested to breach the baseline.`,
        `📉 **Gravitational Pull:** ${metricName} dropped to ${value} (Baseline: ${baseline}). Re-calibrating strategy is highly recommended to prevent decay.`,
        `🔋 **Low Energy Alert:** ${metricName} needs a ${((target - value) / value * 100).toFixed(1)}% surge to hit its target. Initiate emergency optimization!`
      ]
    };
  
    // 3. Determine tier based on target completion & growth
    let tier = 'solid';
    if (pctOfTarget >= 110 || growthRate > 25) {
      tier = 'legendary';
    } else if (pctOfTarget < 80 || growthRate < 0) {
      tier = 'needsWork';
    }
  
    // 4. Randomly pick a template from the matching tier
    const tierTemplates = templates[tier];
    const selectedTemplate = tierTemplates[Math.floor(Math.random() * tierTemplates.length)];
  
    return {
      metric: metricName,
      insight: selectedTemplate,
      tier: tier,
      statsSummary: {
        current: value,
        target: target,
        baseline: baseline,
        growth: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`
      }
    };
  }
  
  // ==================== EXAMPLE USAGE ====================
  
  // Example 1: Massive Overperformance
  console.log(generateWildAIInsight({
    metricName: "Daily Active Users",
    value: 15000,
    target: 10000,
    baseline: 8000
  }));
  
  // Example 2: Underperforming Metric
  console.log(generateWildAIInsight({
    metricName: "Conversion Rate",
    value: 1.8,
    target: 3.5,
    baseline: 2.2
  }));