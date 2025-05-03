// MAP HTML TOOLTIP COMPONENTS

import { PRIMARY_CATEGORIES } from "@/types/Categories";
import { format } from "date-fns";

export const TruckTooltipHtml = (transit: TransitData, charityTo?: CharityData, charityFrom?: CharityData): string => {
  return `
    <div style="width: 100%; max-width: 28rem; overflow: hidden;">
      <div style="padding: 1.25rem 1.5rem 1rem; display: flex; align-items: center; justify-content: space-between; background-color: rgba(241, 245, 249, 0.8); border-bottom: 1px solid rgba(226, 232, 240, 0.8);">
        <div style="font-size: 1.125rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; color: #0f172a;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
            <path d="M12 3v6"></path>
          </svg>
          Resource in Transit
        </div>
        <div style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; background-color: #10b98133; color: #059669;">In Transit</div>
      </div>
      
      <div style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; background-color: white;">
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-weight: 500; color: #64748b; min-width: 5rem; flex-shrink: 0;">Trasnit ID:</span>
          <span style="font-family: monospace; font-size: 0.875rem; background-color: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${transit.id}</span>
        </div>
        
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-weight: 500; color: #64748b; min-width: 5rem; flex-shrink: 0;">From:</span>
          <span style="font-weight: 400; color: #0f172a;">${charityFrom?.name || transit.charity_from}</span>
        </div>
        
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-weight: 500; color: #64748b; min-width: 5rem; flex-shrink: 0;">To:</span>
          <span style="font-weight: 600; color: #0f172a;">${charityTo?.name || transit.charity_to}</span>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-weight: 500; color: #64748b; min-width: 5rem; flex-shrink: 0;">Resource ID:</span>
          <span style="font-family: monospace; font-size: 0.875rem; background-color: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">${transit.resource_id}</span>
        </div>
        
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
          <span style="font-weight: 500; color: #64748b; min-width: 5rem; flex-shrink: 0;">Quantity:</span>
          <span style="font-weight: 400; color: #0f172a;">${transit.quantity}</span>
        </div>
        
        ${transit.description ? `
        <div style="height: 1px; background-color: #e2e8f0; margin: 0.5rem 0;"></div>
        <p style="font-size: 0.875rem; line-height: 1.4; color: #334155; margin: 0;">${transit.description || 'No description available'}</p>
        ` : ''}
        
        <div style="margin-top: 0.5rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 0.5rem;">
          ${transit.time_sent ? `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748b;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Sent: ${format(transit.time_sent, "dd/MM/yyyy")}
          </div>
          ` : ''}
          
          ${transit.time_received ? `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748b;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Received: ${format(transit.time_received, "dd/MM/yyyy")}
          </div>
          ` : ''}
          
          ${transit.can_expire ? `
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #ef4444;">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Perishable Resource
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};

export const TruckIconHtml = (lineColor: string, transit: TransitData, currentCharity: CharityData): string => {
  return `
    <div style="background-color: ${lineColor};border-radius: 50%;width: 30px;height: 30px;display: flex;justify-content: center;align-items: center;${transit.charity_to === currentCharity?.id ? 'transform: scaleX(-1);' : ''}">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 17h4V5H2v12h3"/>
        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/>
        <circle cx="7.5" cy="17.5" r="2.5"/>
        <circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    </div>
  `;
};


export const CharityTooltip = (charity: CharityData): string => {
  return `
    <div style="padding: 1rem; width: 100%;">
      <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">${charity.name}</h3>
      ${charity.description ? `<p style="font-size: 0.875rem; color: #718096; margin-bottom: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${charity.description && charity.description.substring(0, 50) + '...'}</p>` : ''}
      
      <div style="margin-bottom: 0.75rem;">
        <span style="display: inline-block; background-color: #E6F0FD; color: #1E429F; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-right: 0.25rem;">
          ${PRIMARY_CATEGORIES.find(c => c.value === charity.category_and_tags.primary)?.label || charity.category_and_tags.primary}
        </span>
        ${charity.category_and_tags.secondary.slice(0, 2).map(tag => `
          <span style="display: inline-block; background-color: #F1F1F1; color: #4A5568; font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; margin-right: 0.25rem;">
            ${tag}
          </span>
        `).join('')}
      </div>

      ${charity.rating > 0 ? `
        <div style="display: flex; align-items: center; margin-bottom: 0.75rem;">
          <div style="display: flex;">
            <p style="margin: 2px 0; font-size: 16px;">⭐ ${charity.rating} / 5 (${charity.total_rating} ratings)</p>
          </div>
        </div>
      ` : ''}

      <div style="display: flex; align-items: flex-start; margin-bottom: 0.5rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; margin-top: 0.25rem; flex-shrink: 0; color: #718096;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span style="font-size: 0.875rem;">${charity.address}</span>
      </div>

      ${charity.opening_hours ? `
        <div style="display: flex; align-items: flex-start; margin-bottom: 0.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 0.5rem; margin-top: 0.25rem; flex-shrink: 0; color: #718096;">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div style="font-size: 0.875rem;">
            ${(() => {
              const today = format(new Date(), "dd/MM/yyyy");
              const hours = charity.opening_hours[today];
              if (hours?.isOpen) {
                return `Today: ${hours.start} - ${hours.end}`;
              }
              return "Closed today";
            })()}
          </div>
        </div>
      ` : ''}
    </div>
  `;
};