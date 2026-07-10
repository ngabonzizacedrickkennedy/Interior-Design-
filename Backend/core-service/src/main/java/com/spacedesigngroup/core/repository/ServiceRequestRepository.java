package com.spacedesigngroup.core.repository;

import com.spacedesigngroup.core.model.ServiceRequest;
import com.spacedesigngroup.core.model.RequestStatus;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByClientId(Long clientId);

    List<ServiceRequest> findByAssignedStaffId(Long staffId);

    List<ServiceRequest> findByExecutionStatus(RequestStatus status);
}
