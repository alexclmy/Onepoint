/**
 * Script de test pour vérifier les connexions Supabase et OpenAI
 * Usage: node scripts/test-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

async function testConnections() {
  console.log('🔍 Test des connexions...\n');

  // Test 1: Variables d'environnement
  console.log('📋 Vérification des variables d\'environnement...');
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY?.substring(0, 20) + '...',
  };

  Object.entries(envVars).forEach(([key, value]) => {
    if (!value || value === '...') {
      console.log(`   ❌ ${key}: Non définie`);
    } else {
      console.log(`   ✅ ${key}: ${value}`);
    }
  });

  const hasAllEnvVars = Object.values(envVars).every(v => v && v !== '...');
  if (!hasAllEnvVars) {
    console.log('\n❌ Certaines variables d\'environnement sont manquantes.');
    console.log('   Veuillez remplir le fichier .env.local\n');
    process.exit(1);
  }

  // Test 2: Connexion Supabase
  console.log('\n🗄️  Test de connexion à Supabase...');
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test simple: récupérer les tables
    const { data: companies, error } = await supabase
      .from('company')
      .select('*')
      .limit(1);

    if (error) {
      console.log(`   ❌ Erreur Supabase: ${error.message}`);
      console.log('   💡 Vérifiez que vous avez bien exécuté le script SQL dans Supabase\n');
    } else {
      console.log('   ✅ Connexion Supabase réussie !');
      console.log(`   📊 Table 'company' accessible (${companies.length} entrées)\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur de connexion Supabase: ${error.message}\n`);
  }

  // Test 3: Connexion OpenAI
  console.log('🤖 Test de connexion à OpenAI...');
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    console.log('   ✅ Connexion OpenAI réussie !');
    console.log(`   🎯 Modèle testé: ${response.model}`);
    console.log(`   💬 Réponse: ${response.choices[0].message.content}\n`);
  } catch (error) {
    console.log(`   ❌ Erreur OpenAI: ${error.message}`);
    if (error.message.includes('quota')) {
      console.log('   💡 Vous avez peut-être dépassé votre quota. Ajoutez des crédits sur platform.openai.com\n');
    } else if (error.message.includes('Invalid API key')) {
      console.log('   💡 Clé API invalide. Vérifiez votre OPENAI_API_KEY dans .env.local\n');
    }
  }

  console.log('✅ Tests terminés !\n');
}

testConnections().catch(console.error);
