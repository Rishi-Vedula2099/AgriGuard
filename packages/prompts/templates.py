"""
Prompt templates for AgriGuard AI services.
"""

RECOMMENDATION_PROMPT = """Based on the following disease detection result, provide practical farming recommendations:

Disease: {disease_name}
Crop: {crop}
Severity: {severity}
Confidence: {confidence}

Provide recommendations in these categories:
1. Organic solutions (prioritize these)
2. Chemical treatments (with safety warnings)
3. Preventive measures
4. Spread control strategies

Keep language simple and farmer-friendly. Focus on solutions available in India.
"""
