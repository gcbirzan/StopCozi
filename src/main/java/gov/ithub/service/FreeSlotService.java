package gov.ithub.service;

import gov.ithub.dao.AppointmentDao;
import gov.ithub.dao.ServiceDao;
import gov.ithub.model.Appointment;
import gov.ithub.model.FreeSlot;
import gov.ithub.model.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
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
	
	private final long ONE_SECOND_IN_MILLIS = 1000;

	private Date addSecondsToDate(Date op1, long sec) {
		return new Date(op1.getTime() + sec * ONE_SECOND_IN_MILLIS);
	}
	
	private Date getLastDayOfMonth(Date date) {
		Calendar c = Calendar.getInstance();
		c.setTime(date);
		c.set(Calendar.DAY_OF_MONTH, c.getActualMaximum(Calendar.DAY_OF_MONTH));
		return c.getTime();
	}
	
	private ArrayList<FreeSlot> getFreeSlotsBetweenEmptyInterval(Long duration, Date start, Date end) {
		ArrayList<FreeSlot> freeSlots = new ArrayList<>();
		long startTimeMin = start.getTime() / ONE_SECOND_IN_MILLIS;
		long endTimeMin = end.getTime() / ONE_SECOND_IN_MILLIS;
		
		int count = (int) ((endTimeMin - startTimeMin) / duration);
		
		for (int i = 0; i < count; i++) {
			FreeSlot slot = new FreeSlot();
			Date slotStartDate = addSecondsToDate(start, i * duration);
			Date slotEndDate = addSecondsToDate(start, (i + 1) * duration);
			
			slot.setStart(slotStartDate);
			slot.setEnd(slotEndDate);
			
			freeSlots.add(slot);
		}
		
		return freeSlots;
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
    	Service service = serviceDao.findById(serviceId);
    	//FIXME: we need proper DAO implementation.
    	List<Appointment> appointments = new ArrayList<>();
    	ArrayList<FreeSlot> freeSlots = new ArrayList<>();
    	Long duration = service.getDuration();
    	
    	for (int i = 0; i < appointments.size() - 1; i++) {
    		Appointment currentAppointment = appointments.get(i);
    		Appointment nextAppointment = appointments.get(i + 1);
    		
    		freeSlots.addAll(getFreeSlotsBetweenEmptyInterval(duration, currentAppointment.getEnd(), nextAppointment.getStart()));
    	}
    	
        return freeSlots;
    }
}
