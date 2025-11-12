/**
 * API Route: Filter Management
 * Manage ad blocking filter rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { FilterRule } from '@/types/adblock';

const FILTERS_DIR = path.join(process.cwd(), 'src', 'app', 'admin', 'filters');

// Ensure directory exists
async function ensureDir() {
  try {
    await fs.mkdir(FILTERS_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

// GET: List all filter rules
export async function GET() {
  try {
    await ensureDir();
    
    const files = await fs.readdir(FILTERS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const filters: FilterRule[] = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(FILTERS_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const filter = JSON.parse(content);
      filters.push(filter);
    }
    
    // Sort by priority and creation date
    filters.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return NextResponse.json({
      success: true,
      filters,
      total: filters.length
    });
  } catch (error) {
    console.error('Error reading filters:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read filters' },
      { status: 500 }
    );
  }
}

// POST: Create new filter rule
export async function POST(request: NextRequest) {
  try {
    await ensureDir();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.pattern || !body.action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ID
    const id = `${body.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const filter: FilterRule = {
      id,
      type: body.type,
      action: body.action,
      pattern: body.pattern,
      isRegex: body.isRegex || false,
      domains: body.domains || [],
      excludeDomains: body.excludeDomains || [],
      priority: body.priority || 'medium',
      enabled: body.enabled !== false,
      description: body.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body // Include type-specific fields
    };
    
    // Save to file
    const filePath = path.join(FILTERS_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(filter, null, 2), 'utf-8');
    
    console.log(`✅ Created filter: ${id}`);
    
    return NextResponse.json({
      success: true,
      filter
    });
  } catch (error) {
    console.error('Error creating filter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create filter' },
      { status: 500 }
    );
  }
}

// DELETE: Remove filter rule
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Filter ID required' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(FILTERS_DIR, `${id}.json`);
    
    try {
      await fs.unlink(filePath);
      console.log(`✅ Deleted filter: ${id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Filter deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return NextResponse.json(
          { success: false, error: 'Filter not found' },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting filter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete filter' },
      { status: 500 }
    );
  }
}

// PUT: Update filter rule
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Filter ID required' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(FILTERS_DIR, `${id}.json`);
    
    // Check if exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Filter not found' },
        { status: 404 }
      );
    }
    
    // Read existing
    const content = await fs.readFile(filePath, 'utf-8');
    const existingFilter = JSON.parse(content);
    
    // Update fields
    const updatedFilter: FilterRule = {
      ...existingFilter,
      ...body,
      id, // Keep original ID
      createdAt: existingFilter.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };
    
    // Save
    await fs.writeFile(filePath, JSON.stringify(updatedFilter, null, 2), 'utf-8');
    
    console.log(`✅ Updated filter: ${id}`);
    
    return NextResponse.json({
      success: true,
      filter: updatedFilter
    });
  } catch (error) {
    console.error('Error updating filter:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update filter' },
      { status: 500 }
    );
  }
}
