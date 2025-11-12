/**
 * API: Initialize Default Filters
 * Sets up default ad blocking filters
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { defaultFilters } from '@/utils/adblock/defaultFilters';

const FILTERS_DIR = path.join(process.cwd(), 'src', 'app', 'admin', 'filters');

export async function POST() {
  try {
    // Ensure directory exists
    await fs.mkdir(FILTERS_DIR, { recursive: true });

    let createdCount = 0;

    // Create network rules
    for (const rule of defaultFilters.networkRules) {
      const filePath = path.join(FILTERS_DIR, `${rule.id}.json`);
      try {
        // Check if already exists
        await fs.access(filePath);
      } catch {
        // Doesn't exist, create it
        await fs.writeFile(filePath, JSON.stringify(rule, null, 2), 'utf-8');
        createdCount++;
      }
    }

    // Create cosmetic rules
    for (const rule of defaultFilters.cosmeticRules) {
      const filePath = path.join(FILTERS_DIR, `${rule.id}.json`);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(rule, null, 2), 'utf-8');
        createdCount++;
      }
    }

    // Create scriptlet rules
    for (const rule of defaultFilters.scriptletRules) {
      const filePath = path.join(FILTERS_DIR, `${rule.id}.json`);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(rule, null, 2), 'utf-8');
        createdCount++;
      }
    }

    console.log(`✅ Initialized ${createdCount} default filters`);

    return NextResponse.json({
      success: true,
      message: `Initialized ${createdCount} default filters`,
      created: createdCount
    });
  } catch (error) {
    console.error('Error initializing default filters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize filters' },
      { status: 500 }
    );
  }
}
