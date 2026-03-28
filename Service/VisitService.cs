using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SistemaSaludos.Modelo.Visit;
using SistemaSaludos.Repository;

namespace SistemaSaludos.Service;

public class VisitService
{
    private readonly VisitRepository visitRepository; // sin guion bajo

    public VisitService(VisitRepository visitRepository)
    {
        this.visitRepository = visitRepository;
    }

    public async Task<List<Visit>> GetAllAsync()
    {
        return await visitRepository.GetAllAsync();
    }

    public async Task<List<Visit>> GetTodayAsync()
    {
        var allVisits = await visitRepository.GetAllAsync();
        var today = DateTime.Today.ToString("yyyy-MM-dd");
        return allVisits.Where(v => v.date == today).ToList();
    }

    public async Task<Visit?> GetByIdAsync(int id)
    {
        return await visitRepository.GetByIdAsync(id);
    }

    public async Task<Visit?> AddAsync(Visit visit)
    {
        return await visitRepository.AddAsync(visit);
    }

    public async Task<(int synced, string message)> SyncFromIdeeoAsync()
    {
        return await visitRepository.SyncFromIdeeoAsync();
    }
}
