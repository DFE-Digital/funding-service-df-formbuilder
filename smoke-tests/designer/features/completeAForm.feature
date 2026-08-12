Feature: Complete a form
  As a forms user
  I want to complete a form
  So that I submit my form successfully

  # Cookie issue exists in the pipeline
  @wip
  Scenario: Complete the test form
    Given I am at the start of the "test" form
    And I complete the form
    When I view the Summary page
    And I submit the completed form
    Then the "Application complete" page is displayed

  Scenario: Testing condition - User does not have a link
    Given I am at the start of the "test" form
    When I choose "No, I don't have a link"
    Then I taken directly to the page titled "Do you have a UK passport?"

  Scenario: Complete the runner components test form
    Given I am at the start of the "runner components test" form
    When I complete the form
    Then the Summary page is displayed with my answers