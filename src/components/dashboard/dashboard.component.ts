import { Component, ChangeDetectionStrategy, inject, computed, AfterViewInit, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { PatientDataService, Patient } from '../../services/patient-data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private patientService = inject(PatientDataService);
  patients = this.patientService.patients;
  
  appointments = this.patientService.getAppointments();

  @ViewChild('patientConditionsChart') private conditionsChartContainer!: ElementRef;
  @ViewChild('doctorWorkloadChart') private workloadChartContainer!: ElementRef;
  @ViewChild('admissionsChart') private admissionsChartContainer!: ElementRef;

  private observer?: ResizeObserver;

  totalPatients = computed(() => this.patients().length);
  criticalPatients = computed(() => this.patients().filter(p => p.condition === 'Critical').length);
  stablePatients = computed(() => this.patients().filter(p => p.condition === 'Stable').length);
  recoveringPatients = computed(() => this.patients().filter(p => p.condition === 'Recovering').length);

  constructor() {
    effect(() => {
      // Re-render charts when patient data changes, but only after view is initialized.
      if (this.conditionsChartContainer) {
        this.patients(); // This establishes the dependency on the signal
        requestAnimationFrame(() => this.renderCharts());
      }
    });
  }

  ngAfterViewInit() {
    this.observer = new ResizeObserver(entries => {
      requestAnimationFrame(() => this.renderCharts());
    });
    this.observer.observe(this.conditionsChartContainer.nativeElement.parentElement);
    this.observer.observe(this.workloadChartContainer.nativeElement.parentElement);
    this.observer.observe(this.admissionsChartContainer.nativeElement.parentElement);
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private renderCharts() {
    this.createPatientConditionsChart();
    this.createDoctorWorkloadChart();
    this.createAdmissionsChart();
  }

  private createPatientConditionsChart() {
    const element = this.conditionsChartContainer.nativeElement;
    d3.select(element).select('svg').remove();

    const conditionCounts = this.patients().reduce((acc, patient) => {
      acc[patient.condition] = (acc[patient.condition] || 0) + 1;
      return acc;
    }, {} as Record<Patient['condition'], number>);

    const data = Object.entries(conditionCounts).map(([key, value]) => ({ condition: key, count: value }));

    const width = element.offsetWidth;
    const height = 250;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.condition))
      .range(['#ef4444', '#f59e0b', '#22c55e', '#6366f1']); 

    const pie = d3.pie().value((d: any) => d.count).sort(null);
    const data_ready = pie(data);

    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius);

    svg.selectAll('path')
      .data(data_ready)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d: any) => color(d.data.condition))
      .attr('stroke', '#1e293b') // slate-800
      .style('stroke-width', '4px');

    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .style('font-size', '1.5rem')
      .style('font-weight', 'bold')
      .style('fill', '#f1f5f9') // slate-100
      .text(this.patients().length);
  }

  private createDoctorWorkloadChart() {
    const element = this.workloadChartContainer.nativeElement;
    d3.select(element).select('svg').remove();

    const workload = this.appointments.reduce((acc, app) => {
      acc[app.doctorName] = (acc[app.doctorName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(workload).map(([name, count]) => ({ name: name.replace('Dr. ', ''), count }));
    
    const margin = { top: 20, right: 20, bottom: 80, left: 40 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const axisColor = '#94a3b8'; // slate-400
    const domainColor = '#475569'; // slate-600

    const x = d3.scaleBand().range([0, width]).domain(data.map(d => d.name)).padding(0.2);
    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    xAxisGroup.selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', axisColor);
    xAxisGroup.select('.domain').attr('stroke', domainColor);
    xAxisGroup.selectAll('.tick line').attr('stroke', domainColor);

    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.count) ?? 0]).range([height, 0]);
    const yAxisGroup = svg.append('g').call(d3.axisLeft(y));
    yAxisGroup.selectAll('text').style('fill', axisColor);
    yAxisGroup.select('.domain').attr('stroke', domainColor);
    yAxisGroup.selectAll('.tick line').attr('stroke', domainColor);


    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.name) as number)
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', '#6366f1');
  }

  private createAdmissionsChart() {
    const element = this.admissionsChartContainer.nativeElement;
    d3.select(element).select('svg').remove();
    
    const admissionsByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        admissionsByDay[d.toISOString().split('T')[0]] = 0;
    }

    this.patients().forEach(p => {
        if (admissionsByDay[p.admissionDate] !== undefined) {
            admissionsByDay[p.admissionDate]++;
        }
    });

    const data = Object.entries(admissionsByDay).map(([date, count]) => ({ date: new Date(date), count }));

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const axisColor = '#94a3b8'; // slate-400
    const domainColor = '#475569'; // slate-600

    const x = d3.scaleTime().domain(d3.extent(data, d => d.date) as [Date, Date]).range([0, width]);
    const xAxisGroup = svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat('%a')));
    xAxisGroup.selectAll('text').style('fill', axisColor);
    xAxisGroup.select('.domain').attr('stroke', domainColor);
    xAxisGroup.selectAll('.tick line').attr('stroke', domainColor);


    const y = d3.scaleLinear().domain([0, (d3.max(data, d => d.count) ?? 0) * 1.2]).range([height, 0]);
    const yAxisGroup = svg.append('g').call(d3.axisLeft(y));
    yAxisGroup.selectAll('text').style('fill', axisColor);
    yAxisGroup.select('.domain').attr('stroke', domainColor);
    yAxisGroup.selectAll('.tick line').attr('stroke', domainColor);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#818cf8') // indigo-400
      .attr('stroke-width', 2.5)
      .attr('d', d3.line().x((d:any) => x(d.date)).y((d:any) => y(d.count)));
  }
}