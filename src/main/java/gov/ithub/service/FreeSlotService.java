package gov.ithub.service;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.OfficeDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.FreeSlot;
import gov.ithub.model.Office;
import gov.ithub.model.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * Created by claudiubar on 10/8/2016.
 */
@Component
public class FreeSlotService {

    @Autowired
    private AppointmentDao appointmentDao;
    
    @Autowired
    private ServiceDao serviceDao;
    
    @Autowired
    private OfficeDao officeDao;
	
	private final long ONE_SECOND_IN_MILLIS = 1000;
	private final long ONE_MINUTE_IN_SECONDS = 60;

	private Date addSecondsToDate(Date op1, long sec) {
		return new Date(op1.getTime() + sec * ONE_SECOND_IN_MILLIS);
	}
	
	private Date getLastDayOfMonth(Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.set(Calendar.DAY_OF_MONTH, c.getActualMaximum(Calendar.DAY_OF_MONTH));
		c.set(Calendar.HOUR_OF_DAY, 23);
		return c.getTime();
	}
	
	private boolean intervalsAreEqual(Date start1, Date end1, Date start2, Date end2) {
		return start1.equals(start2) && end1.equals(end2);
	}
	
	private boolean intervalIsInWorkingHours(Date start, Date end, Integer workIntervalStart, Integer workIntervalEnd) {
		Calendar calendarStart = Calendar.getInstance();
		Calendar calendarEnd = Calendar.getInstance();
		calendarStart.setTime(start);
		calendarEnd.setTime(end);
		
		if (calendarStart.get(Calendar.HOUR_OF_DAY) >= workIntervalStart && 
				calendarStart.get(Calendar.HOUR_OF_DAY) < workIntervalEnd &&
				calendarEnd.get(Calendar.HOUR_OF_DAY) >= workIntervalStart && 
				calendarEnd.get(Calendar.HOUR_OF_DAY) < workIntervalEnd) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * 
	 * Get free slots for serviceId between startDate and the end of startDate's month. 
	 * 
	 * @param serviceId The service id for which we need the free slots.
	 * @param startDate The start date of the query.
	 * @return
	 */
    public List<FreeSlot> getFreeSlots(Long serviceId, Date startDate) {
    	Date endDate = getLastDayOfMonth(startDate);
    	
    	Service service = serviceDao.findById(serviceId);
    	
    	if (service == null) {
    		return null;
    	}
    	
    	List<Appointment> appointments = appointmentDao.getAppointmentsForService(serviceId, startDate, endDate);
    	ArrayList<Office> offices  = (ArrayList<Office>) officeDao.findByServiceId(serviceId);
    	
    	ArrayList<FreeSlot> freeSlots = new ArrayList<>();
    	Long duration = service.getDuration() * ONE_MINUTE_IN_SECONDS;
    	
    	int numberOfSlots = (int) ((endDate.getTime() - startDate.getTime()) / ONE_SECOND_IN_MILLIS / duration);
    	
    	for (int i = 0; i < numberOfSlots; i++) {
			Date slotStartDate = addSecondsToDate(startDate, i * duration);
			Date slotEndDate = addSecondsToDate(startDate, ((i + 1) * duration));
			int numberOfFreeOffices = offices.size();
			
			//TODO: 1. remove hardcoded values.
			//2. Possible optimization: remove this slots directly from the iteration process.
			if (!intervalIsInWorkingHours(slotStartDate, slotEndDate, 8, 18)) {
				continue;
			}
			
			for (Appointment appointment : appointments) {
				if (appointment.getStart().after(slotEndDate)) {
					//TODO we could do some more optimizations here, like:
					//remove the appointments from the appointments array when we passed them.
					break;
				}
				
				if (intervalsAreEqual(slotStartDate, slotEndDate, appointment.getStart(), appointment.getEnd())) {
					numberOfFreeOffices--;
				}
			}
			
			if (numberOfFreeOffices != 0) {
				FreeSlot slot = new FreeSlot();
				slot.setStart(slotStartDate);
				slot.setEnd(slotEndDate);
				
				slot.setService(service);
				freeSlots.add(slot);
			}
    	}
    	
        return freeSlots;
    }
}
