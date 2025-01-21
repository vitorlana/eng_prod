// Manufacturing Data Generator for Medical Device Production
const fs = require('fs');
const path = require('path');

// Ensure output directory exists
const OUTPUT_DIR = path.join(__dirname, 'prod-data-reports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Production Data Generator
const generateProductionData = () => {
  const dates = [];
  const currentDate = new Date('2024-01-01');
  const endDate = new Date('2024-12-31');

  // Base production rates (units per day)
  const baseRates = {
    'X1_Pro': 85,    // Base rate allows for cleanroom constraints
    'X1_Standard': 120,
    'X1_Mini': 100
  };

  const data = [];

  while (currentDate <= endDate) {
    const month = currentDate.getMonth();
    const dayOfWeek = currentDate.getDay();

    // Skip weekends to maintain cleanroom standards
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      let row = {
        date: currentDate.toISOString().split('T')[0],
        X1_Pro: baseRates.X1_Pro,
        X1_Standard: baseRates.X1_Standard,
        X1_Mini: baseRates.X1_Mini
      };

      // Q4 increased demand for X1 Pro (20-30% increase)
      if (month >= 9) {  // October-December
        row.X1_Pro *= (1 + 0.2 + Math.random() * 0.1);
      }

      // Summer popularity for Mini (June-August)
      if (month >= 5 && month <= 7) {
        row.X1_Mini *= (1 + 0.15 + Math.random() * 0.1);
      }

      // Holiday production adjustments (December)
      if (month === 11) {
        const multiplier = 0.8 + Math.random() * 0.1; // Reduced production
        row.X1_Pro *= multiplier;
        row.X1_Standard *= multiplier;
        row.X1_Mini *= multiplier;
      }

      // Add some random variation (±5%) to account for environmental factors
      Object.keys(baseRates).forEach(model => {
        const variation = 0.95 + Math.random() * 0.1;
        row[model] = Math.round(row[model] * variation);
      });

      data.push(row);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
};

// Quality Metrics Generator
const generateQualityData = (productionData) => {
  // Base defect rates per category (percentage)
  const baseDefects = {
    molding_defects: 0.8,    // Base 0.8% defect rate
    assembly_issues: 0.5,     // Base 0.5% defect rate
    electronic_defects: 0.3,  // Base 0.3% defect rate
    packaging_defects: 0.2    // Base 0.2% defect rate
  };

  return productionData.map(prod => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    // Temperature impact (higher defects in summer)
    const tempFactor = month >= 5 && month <= 7 ? 1.2 : 1.0;

    // Humidity impact (higher in rainy season)
    const humidityFactor = month >= 3 && month <= 5 ? 1.15 : 1.0;

    // Volume impact (higher defects during peak production)
    const volumeFactor = totalProduction > 300 ? 1.1 : 1.0;

    // Calculate temperature and humidity based on cleanroom specs
    const baseTemp = 20; // 20°C base
    const baseHumidity = 45; // 45% RH base

    let qualityRow = {
      date: prod.date,
      temperature: baseTemp + (Math.random() * 0.5 - 0.25),  // 20°C ±0.25°C
      humidity: baseHumidity + (Math.random() * 5 - 2.5),    // 45% ±2.5%
      molding_defects: Math.round(totalProduction * (baseDefects.molding_defects / 100) * tempFactor * (0.9 + Math.random() * 0.2)),
      assembly_issues: Math.round(totalProduction * (baseDefects.assembly_issues / 100) * volumeFactor * (0.9 + Math.random() * 0.2)),
      electronic_defects: Math.round(totalProduction * (baseDefects.electronic_defects / 100) * humidityFactor * (0.9 + Math.random() * 0.2)),
      packaging_defects: Math.round(totalProduction * (baseDefects.packaging_defects / 100) * volumeFactor * (0.9 + Math.random() * 0.2))
    };

    return qualityRow;
  });
};



// Process Control Data Generator
const generateProcessControlData = (productionData, qualityData) => {
  // Base process parameters for medical device manufacturing
  const baseParams = {
    mold_temp: 180,      // Molding temperature (°C)
    mold_pressure: 500,  // Molding pressure (bar)
    flow_rate: 25,       // Material flow rate (g/s)
    cycle_time: 45       // Base cycle time (seconds)
  };

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const quality = qualityData[idx];
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    // Calculate process parameters with seasonal and production-based variations
    let processRow = {
      date: prod.date,
      ambient_temp: quality.temperature,
      ambient_humidity: quality.humidity,
      mold_temp: baseParams.mold_temp + (Math.random() * 2 - 1),  // ±1°C variation
      mold_pressure: baseParams.mold_pressure * (0.98 + Math.random() * 0.04), // ±2% variation
      flow_rate: baseParams.flow_rate * (0.95 + Math.random() * 0.1), // ±5% variation
      cycle_time: baseParams.cycle_time
    };

    // Adjust for seasonal factors
    if (month >= 5 && month <= 7) {  // Summer months
      processRow.mold_temp -= 1.5;  // Compensate for higher ambient temp
      processRow.flow_rate *= 1.05; // Slightly faster flow rate needed
    }

    // Adjust for high humidity
    if (quality.humidity > 47) {
      processRow.cycle_time *= 1.1; // Longer cycle time when humidity is high
    }

    // Adjust for high production volumes
    if (totalProduction > 300) {
      processRow.cycle_time *= 0.95; // Slightly faster cycle time for high volume
      processRow.flow_rate *= 1.05;  // Increased flow rate
    }

    return processRow;
  });
};

// Equipment Performance Data Generator
const generateEquipmentData = (productionData, processData) => {
  // Base equipment parameters for medical device manufacturing
  const baseParams = {
    oee: 0.85,                // Overall Equipment Effectiveness (85%)
    availability: 0.95,       // Equipment Availability (95%)
    performance: 0.92,        // Performance Rate (92%)
    quality: 0.98,            // Quality Rate (98%)
    energy_usage: 250,        // Base energy usage (kWh/day)
    maintenance_score: 95     // Equipment health score (0-100)
  };

  let lastMaintenance = 0;  // Days since last maintenance
  let maintenanceDue = false;

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const process = processData[idx];
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    // Increment days since maintenance
    lastMaintenance++;

    // Determine if maintenance is due (every 30 days)
    maintenanceDue = lastMaintenance >= 30;

    let equipRow = {
      date: prod.date,
      oee: baseParams.oee,
      availability: baseParams.availability,
      performance: baseParams.performance,
      quality: baseParams.quality,
      energy_usage: baseParams.energy_usage,
      maintenance_score: baseParams.maintenance_score,
      days_since_maintenance: lastMaintenance,
      maintenance_scheduled: maintenanceDue ? 1 : 0
    };

    // Impact of high temperature on equipment
    if (process.ambient_temp > 20.2) {
      equipRow.performance *= 0.98;
      equipRow.energy_usage *= 1.15;
    }

    // Impact of equipment age (maintenance score decay)
    equipRow.maintenance_score = baseParams.maintenance_score *
      (1 - (lastMaintenance * 0.005));

    // Reset after maintenance
    if (maintenanceDue) {
      lastMaintenance = 0;
      equipRow.maintenance_score = baseParams.maintenance_score;
      equipRow.performance = baseParams.performance; // Reset performance
      equipRow.energy_usage = baseParams.energy_usage; // Reset energy usage
    }

    // Summer impact on equipment (June-August)
    if (month >= 5 && month <= 7) {
      equipRow.performance *= 0.97;
      equipRow.energy_usage *= 1.2;
    }

    // Adjust performance based on production volume
    if (totalProduction > 300) {
      equipRow.performance *= 0.97;
      equipRow.energy_usage *= 1.2;
    }

    // Calculate final OEE
    equipRow.oee = (equipRow.availability * equipRow.performance * equipRow.quality).toFixed(4);

    // Round values for consistency
    equipRow.maintenance_score = Number(equipRow.maintenance_score.toFixed(2));
    equipRow.energy_usage = Math.round(equipRow.energy_usage);
    equipRow.performance = Number(equipRow.performance.toFixed(4));

    return equipRow;
  });
};


// Resource Allocation Data Generator
const generateResourceData = (productionData, equipmentData) => {
  // Base resource parameters for medical device manufacturing
  const baseParams = {
    operators_per_shift: 15,     // Base operators per shift
    technicians_per_shift: 5,    // Base technicians per shift
    setup_time_hours: 2,         // Standard setup time
    training_hours: 4,           // Daily training hours
    equipment_utilization: 0.85   // Base equipment utilization
  };

  // Track training cycles
  let trainingCycle = 0;  // Increments monthly for training schedules
  let lastTrainingMonth = -1;

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const equipment = equipmentData[idx];
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    // Update training cycle if new month
    if (month !== lastTrainingMonth) {
      trainingCycle++;
      lastTrainingMonth = month;
    }

    // Calculate staffing adjustments
    let staffingMultiplier = 1.0;
    if (totalProduction > 300) staffingMultiplier = 1.2;
    if (month >= 9) staffingMultiplier = 1.15; // Q4 adjustment

    let resourceRow = {
      date: prod.date,
      operators_allocated: Math.round(baseParams.operators_per_shift * staffingMultiplier),
      technicians_allocated: Math.round(baseParams.technicians_per_shift * staffingMultiplier),
      setup_time_hours: baseParams.setup_time_hours,
      training_hours: baseParams.training_hours,
      equipment_utilization: baseParams.equipment_utilization,
      training_day: (trainingCycle % 20 === 0) ? 1 : 0  // Training every 20 days
    };

    // Adjust for maintenance days
    if (equipment.maintenance_scheduled) {
      resourceRow.operators_allocated -= 2;  // Reduce operators
      resourceRow.technicians_allocated += 2; // Add technicians
      resourceRow.setup_time_hours *= 1.5;   // Longer setup times
      resourceRow.equipment_utilization *= 0.7; // Reduced utilization
    }

    // Adjust for training days
    if (resourceRow.training_day) {
      resourceRow.operators_allocated += 2;  // Additional operators for training
      resourceRow.training_hours *= 1.5;    // Extended training hours
      resourceRow.equipment_utilization *= 0.9; // Slightly reduced utilization
      resourceRow.setup_time_hours *= 1.2;  // Longer setup times during training
    }

    // Summer adjustments (June-August)
    if (month >= 5 && month <= 7) {
      resourceRow.operators_allocated += 1;  // Additional operator for summer coverage
      resourceRow.setup_time_hours *= 1.1;  // Slightly longer setup times
    }

    // Holiday season adjustments (December)
    if (month === 11) {
      resourceRow.operators_allocated = Math.round(resourceRow.operators_allocated * 0.9);
      resourceRow.technicians_allocated = Math.round(resourceRow.technicians_allocated * 0.9);
    }

    // Equipment utilization adjustments
    resourceRow.equipment_utilization *= (equipment.performance / 0.92); // Normalize to base performance

    // Round values for consistency
    resourceRow.equipment_utilization = Number(resourceRow.equipment_utilization.toFixed(4));
    resourceRow.setup_time_hours = Number(resourceRow.setup_time_hours.toFixed(2));

    return resourceRow;
  });
};

// Cost Analysis Data Generator
const generateCostData = (productionData, resourceData, equipmentData) => {
  // Base cost parameters for medical device manufacturing
  const baseCosts = {
    material_cost: 150,      // Base material cost per unit
    energy_cost_kwh: 0.12,   // Energy cost per kWh
    labor_cost_hour: 35,     // Average labor cost per hour
    maintenance_cost: 1200,  // Base maintenance cost per event
    overhead_cost: 2000      // Daily overhead cost
  };

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const resource = resourceData[idx];
    const equipment = equipmentData[idx];
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    // Calculate base costs
    let costs = {
      material_cost: totalProduction * baseCosts.material_cost,
      energy_cost: equipment.energy_usage * baseCosts.energy_cost_kwh,
      labor_cost: (resource.operators_allocated + resource.technicians_allocated) * 8 * baseCosts.labor_cost_hour,
      maintenance_cost: equipment.maintenance_scheduled ? baseCosts.maintenance_cost : 0,
      overhead_cost: baseCosts.overhead_cost,
      training_cost: resource.training_day ? (resource.training_hours * resource.operators_allocated * baseCosts.labor_cost_hour * 0.5) : 0
    };

    // Apply seasonal adjustments
    if (month >= 9) {
      costs.material_cost *= 1.08;  // Q4 material cost increase
      costs.labor_cost *= 1.05;     // Q4 labor cost increase
    }

    if (month >= 5 && month <= 7) {
      costs.material_cost *= 0.95;  // Summer material discount
      costs.energy_cost *= 1.2;     // Higher summer energy costs
      costs.overhead_cost *= 1.1;   // Higher overhead in summer
    }

    // Equipment performance impacts
    if (equipment.performance < 0.9) {
      costs.maintenance_cost += 500;  // Additional maintenance costs
      costs.overhead_cost *= 1.05;    // Increased overhead
    }

    // Training day impacts
    if (resource.training_day) {
      costs.overhead_cost *= 1.15;    // Increased overhead on training days
      costs.energy_cost *= 1.05;      // Slightly higher energy usage
    }

    // Holiday season adjustments (December)
    if (month === 11) {
      costs.labor_cost *= 1.1;        // Holiday labor premium
      costs.overhead_cost *= 0.9;     // Reduced overhead during holidays
    }

    // Create the final cost row with rounded values
    let costRow = {
      date: prod.date,
      ...Object.keys(costs).reduce((acc, key) => {
        acc[key] = Number(costs[key].toFixed(2));
        return acc;
      }, {})
    };

    // Calculate total cost
    costRow.total_cost = Number(Object.values(costs)
      .reduce((a, b) => a + b, 0)
      .toFixed(2));

    return costRow;
  });
};


// Capacity Metrics Generator
const generateCapacityData = (productionData, resourceData, equipmentData) => {
  const baseCapacity = {
    max_daily_capacity: 350,    // Units/day
    effective_capacity: 315,    // Accounting for constraints
    min_changeover_time: 45,    // Minutes
    setup_efficiency: 0.92      // Setup efficiency ratio
  };

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const resource = resourceData[idx];
    const equipment = equipmentData[idx];
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    let capacity = {
      date: prod.date,
      max_capacity: baseCapacity.max_daily_capacity,
      effective_capacity: baseCapacity.effective_capacity * equipment.performance,
      utilization_rate: (totalProduction / baseCapacity.effective_capacity).toFixed(4),
      changeover_time: baseCapacity.min_changeover_time,
      setup_efficiency: baseCapacity.setup_efficiency,
      available_hours: 24
    };

    // Maintenance adjustments
    if (equipment.maintenance_scheduled) {
      capacity.available_hours -= 8;
      capacity.effective_capacity *= 0.7;
      capacity.changeover_time *= 1.3;
    }

    // Training impacts
    if (resource.training_day) {
      capacity.effective_capacity *= 0.85;
      capacity.setup_efficiency *= 0.9;
      capacity.changeover_time *= 1.2;
    }

    // Seasonal adjustments
    if (month >= 5 && month <= 7) {    // Summer
      capacity.effective_capacity *= 0.95;
      capacity.setup_efficiency *= 0.98;
    }
    if (month >= 9) {                  // Q4
      capacity.effective_capacity *= 1.1;
      capacity.setup_efficiency *= 1.05;
    }
    if (month === 11) {                // December
      capacity.effective_capacity *= 0.9;
    }

    // Calculate metrics
    capacity.capacity_gap = Math.round(capacity.max_capacity - totalProduction);
    capacity.capacity_utilization = Number((totalProduction / capacity.effective_capacity * 100).toFixed(2));

    // Round values
    capacity.effective_capacity = Number(capacity.effective_capacity.toFixed(2));
    capacity.setup_efficiency = Number(capacity.setup_efficiency.toFixed(4));

    return capacity;
  });
};

// Process Capability Data Generator
const generateProcessCapabilityData = (productionData, qualityData, processData) => {
  const baseCapability = {
    cp: 1.33,       // Process capability
    cpk: 1.25,      // Process capability index
    pp: 1.30,       // Process performance
    ppk: 1.22,      // Process performance index
    stability: 0.95  // Process stability score
  };

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const quality = qualityData[idx];
    const process = processData[idx];

    let metrics = {
      date: prod.date,
      cp: baseCapability.cp,
      cpk: baseCapability.cpk,
      pp: baseCapability.pp,
      ppk: baseCapability.ppk,
      stability: baseCapability.stability
    };

    // Environmental impacts
    if (Math.abs(process.ambient_temp - 20) > 0.3) {
      metrics.cp *= 0.95;
      metrics.stability *= 0.97;
    }

    if (Math.abs(process.ambient_humidity - 45) > 3) {
      metrics.ppk *= 0.96;
      metrics.stability *= 0.98;
    }

    // Seasonal adjustments
    if (month >= 5 && month <= 7) {    // Summer
      metrics.cp *= 0.97;
      metrics.stability *= 0.96;
    }
    if (month === 11) {                // December
      metrics.cp *= 0.95;
      metrics.stability *= 0.94;
    }

    // Model-specific adjustments
    metrics.model_x1_pro_capability = metrics.cp * 0.98;
    metrics.model_x1_standard_capability = metrics.cp * 1.02;
    metrics.model_x1_mini_capability = metrics.cp * 0.97;

    // Post-maintenance performance boost
    if (process.maintenance_day) {
      metrics.cp *= 1.05;
      metrics.stability *= 1.03;
    }

    // Performance calculations
    metrics.overall_performance = (metrics.cp + metrics.cpk + metrics.pp + metrics.ppk) / 4;

    // Round values
    Object.keys(metrics).forEach(key => {
      if (typeof metrics[key] === 'number') {
        metrics[key] = Number(metrics[key].toFixed(4));
      }
    });

    return metrics;
  });
};


// Inventory Tracking Data Generator
const generateInventoryData = (productionData) => {
  const baseInventory = {
    raw_materials_days: 14,
    wip_days: 3,
    finished_goods_days: 5,
    safety_stock_factor: 1.2
  };

  return productionData.map((prod, idx) => {
    const date = new Date(prod.date);
    const month = date.getMonth();
    const totalProduction = prod.X1_Pro + prod.X1_Standard + prod.X1_Mini;

    let inventory = {
      date: prod.date,
      raw_materials_stock: Math.round(totalProduction * baseInventory.raw_materials_days),
      wip_stock: Math.round(totalProduction * baseInventory.wip_days),
      finished_goods_stock: Math.round(totalProduction * baseInventory.finished_goods_days),
      safety_stock: Math.round(totalProduction * baseInventory.safety_stock_factor),
      storage_utilization: 0,
      lead_time_days: 10,
      reorder_point: 0
    };

    // Seasonal adjustments
    if (month >= 9) {  // Q4
      inventory.raw_materials_stock *= 1.2;
      inventory.safety_stock *= 1.15;
      inventory.lead_time_days = 12;
    }
    if (month === 11) {  // December
      inventory.finished_goods_stock *= 0.8;
      inventory.lead_time_days = 15;
    }
    if (month >= 5 && month <= 7) {  // Summer
      inventory.wip_stock *= 0.9;
      inventory.lead_time_days = 9;
    }

    // Calculate reorder point
    const dailyDemand = totalProduction / 20; // Average monthly working days
    inventory.reorder_point = Math.round(dailyDemand * inventory.lead_time_days * 1.1); // 10% buffer

    // Calculate storage utilization
    const totalStorage = inventory.raw_materials_stock + inventory.wip_stock +
      inventory.finished_goods_stock + inventory.safety_stock;
    inventory.storage_utilization = Number((totalStorage / 5000).toFixed(4));

    // Round values
    Object.keys(inventory).forEach(key => {
      if (typeof inventory[key] === 'number' && key !== 'storage_utilization') {
        inventory[key] = Math.round(inventory[key]);
      }
    });

    return inventory;
  });
};


// Maintenance Records Generator
const generateMaintenanceData = (equipmentData) => {
  const baseMaintenanceParams = {
    preventive_hours: 8,
    repair_hours: 4,
    maintenance_cost_hour: 150,
    parts_cost: 800
  };

  let lastPmDate = new Date('2023-12-15');
  let maintenanceId = 1000;

  return equipmentData.map(equip => {
    const date = new Date(equip.date);
    const month = date.getMonth();
    const isPm = equip.maintenance_scheduled;
    const isRepair = equip.performance < 0.88;

    if (!isPm && !isRepair) return null;

    const record = {
      date: equip.date,
      maintenance_id: maintenanceId++,
      type: isPm ? 'preventive' : 'repair',
      duration_hours: isPm ? baseMaintenanceParams.preventive_hours : baseMaintenanceParams.repair_hours,
      labor_cost: 0,
      parts_cost: 0,
      total_cost: 0,
      performance_pre: equip.performance,
      performance_post: isPm ? 0.95 : Math.min(0.92, equip.performance * 1.15)
    };

    // Seasonal adjustments
    if (month >= 5 && month <= 7) {
      record.duration_hours *= 1.2;  // Summer maintenance takes longer
    }
    if (month === 11) {
      record.labor_cost *= 1.1;  // Holiday labor premium
    }

    record.labor_cost = record.duration_hours * baseMaintenanceParams.maintenance_cost_hour;
    record.parts_cost = isPm ? baseMaintenanceParams.parts_cost : baseMaintenanceParams.parts_cost * 0.6;
    record.total_cost = record.labor_cost + record.parts_cost;

    if (isPm) lastPmDate = date;

    // Round values
    record.duration_hours = Number(record.duration_hours.toFixed(2));
    record.labor_cost = Math.round(record.labor_cost);
    record.parts_cost = Math.round(record.parts_cost);
    record.total_cost = Math.round(record.total_cost);
    record.performance_pre = Number(record.performance_pre.toFixed(4));
    record.performance_post = Number(record.performance_post.toFixed(4));

    return record;
  }).filter(record => record !== null);
};


const generateAllData = () => {
  // Generate all datasets with dependencies
  const productionData = generateProductionData();
  const qualityData = generateQualityData(productionData);
  const processControlData = generateProcessControlData(productionData, qualityData);
  const equipmentData = generateEquipmentData(productionData, processControlData);
  const resourceData = generateResourceData(productionData, equipmentData);
  const costData = generateCostData(productionData, resourceData, equipmentData);
  const capacityData = generateCapacityData(productionData, resourceData, equipmentData);
  const processCapabilityData = generateProcessCapabilityData(productionData, qualityData, processControlData);
  const inventoryData = generateInventoryData(productionData);
  const maintenanceData = generateMaintenanceData(equipmentData);

  // Save production data
  const prodHeaders = ['date', 'X1_Pro', 'X1_Standard', 'X1_Mini'];
  const prodCsv = [
    prodHeaders.join(','),
    ...productionData.map(row => prodHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'production_data.csv'), prodCsv);

  // Save quality data
  const qualityHeaders = ['date', 'temperature', 'humidity', 'molding_defects',
    'assembly_issues', 'electronic_defects', 'packaging_defects'];
  const qualityCsv = [
    qualityHeaders.join(','),
    ...qualityData.map(row => qualityHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'quality_metrics.csv'), qualityCsv);

  // Save process control data
  const processHeaders = ['date', 'ambient_temp', 'ambient_humidity', 'mold_temp',
    'mold_pressure', 'flow_rate', 'cycle_time'];
  const processCsv = [
    processHeaders.join(','),
    ...processControlData.map(row => processHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'process_control.csv'), processCsv);

  // Save equipment performance data
  const equipmentHeaders = ['date', 'oee', 'availability', 'performance', 'quality',
    'energy_usage', 'maintenance_score', 'days_since_maintenance', 'maintenance_scheduled'];
  const equipmentCsv = [
    equipmentHeaders.join(','),
    ...equipmentData.map(row => equipmentHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'equipment_performance.csv'), equipmentCsv);

  // Save resource allocation data
  const resourceHeaders = ['date', 'operators_allocated', 'technicians_allocated',
    'setup_time_hours', 'training_hours', 'equipment_utilization', 'training_day'];
  const resourceCsv = [
    resourceHeaders.join(','),
    ...resourceData.map(row => resourceHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'resource_allocation.csv'), resourceCsv);

  // Save cost analysis data
  const costHeaders = ['date', 'material_cost', 'energy_cost', 'labor_cost',
    'maintenance_cost', 'overhead_cost', 'training_cost', 'total_cost'];
  const costCsv = [
    costHeaders.join(','),
    ...costData.map(row => costHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'cost_analysis.csv'), costCsv);

  // Save capacity metrics data
  const capacityHeaders = ['date', 'max_capacity', 'effective_capacity', 'utilization_rate',
    'changeover_time', 'setup_efficiency', 'available_hours', 'capacity_gap', 'capacity_utilization'];
  const capacityCsv = [
    capacityHeaders.join(','),
    ...capacityData.map(row => capacityHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'capacity_metrics.csv'), capacityCsv);

  // Save process capability data
  const capabilityHeaders = ['date', 'cp', 'cpk', 'pp', 'ppk', 'stability',
    'model_x1_pro_capability', 'model_x1_standard_capability',
    'model_x1_mini_capability', 'overall_performance'];
  const capabilityCsv = [
    capabilityHeaders.join(','),
    ...processCapabilityData.map(row => capabilityHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'process_capability.csv'), capabilityCsv);

  // Save inventory tracking data
  const inventoryHeaders = ['date', 'raw_materials_stock', 'wip_stock', 'finished_goods_stock',
    'safety_stock', 'storage_utilization', 'lead_time_days', 'reorder_point'];
  const inventoryCsv = [
    inventoryHeaders.join(','),
    ...inventoryData.map(row => inventoryHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'inventory_tracking.csv'), inventoryCsv);

  // Save maintenance records data
  const maintenanceHeaders = ['date', 'maintenance_id', 'type', 'duration_hours',
    'labor_cost', 'parts_cost', 'total_cost', 'performance_pre', 'performance_post'];
  const maintenanceCsv = [
    maintenanceHeaders.join(','),
    ...maintenanceData.map(row => maintenanceHeaders.map(header => row[header]).join(','))
  ].join('\n');
  fs.writeFileSync(path.join(OUTPUT_DIR, 'maintenance_records.csv'), maintenanceCsv);

  console.log('Generated files in prod-data-reports:');
  console.log('- production_data.csv');
  console.log('- quality_metrics.csv');
  console.log('- process_control.csv');
  console.log('- equipment_performance.csv');
  console.log('- resource_allocation.csv');
  console.log('- cost_analysis.csv');
  console.log('- capacity_metrics.csv');
  console.log('- process_capability.csv');
  console.log('- inventory_tracking.csv');
  console.log('- maintenance_records.csv');
};

generateAllData();
